import express from 'express';

// IoC container для інстансів класів (як @Injectable / DI)
import { container } from '../container';

// Типи для DI
import { Type } from "../types";

// Утиліта для читання metadata з класів / декораторів
import { get } from "../utils";

// Middlewares
import { GuardsMiddleware } from "./guards.middleware";
import { HandlerMiddleware } from "./handler.middleware";
import { FiltersMiddleware } from "./filters.middleware";

// Обгортка для асинхронних handler-ів
import { asyncHandler } from "./async.handler";

export function Factory(modules: any[]) {
  const app = express();
  app.use(express.json());

  const router = express.Router();

  const globalGuards: Array<Type> = [];
  const globalPipes: Array<Type> = [];
  const globalFilters: Array<Type> = [];

  // 🔹 множина вже ініціалізованих модулів
  const initializedModules = new Set<any>();

  function bootstrapModule(mod: any) {
    if (initializedModules.has(mod)) return;
    initializedModules.add(mod);

    const meta = get('mini:module', mod);
    if (!meta) return;

    // 1️⃣ Рекурсивно bootstrap imports
    for (const imported of meta.imports ?? []) {
      bootstrapModule(imported);
    }

    // 2️⃣ Реєструємо providers
    for (const Provider of meta.providers ?? []) {
      container.register(Provider, Provider);
    }

    // 3️⃣ Реєструємо контролери
    for (const Ctl of meta.controllers ?? []) {
      container.register(Ctl, Ctl);

      const prefix = get('mini:prefix', Ctl) ?? '';
      const routes = get('mini:routes', Ctl) ?? [];

      const instance = container.resolve(Ctl) as InstanceType<typeof Ctl>;

      routes.forEach((r: any) => {
        const handler = instance[r.handlerName];

        const path = prefix + r.path;

        console.log(
          `🌀 [Router] [${r.method.toUpperCase()}] ${path} -> ${Ctl.name}.${r.handlerName}`
        );

        (router as any)[r.method](
          path,
          asyncHandler(HandlerMiddleware(instance, handler, globalPipes)),
          asyncHandler(GuardsMiddleware(Ctl, handler, globalGuards))
        );
      });
    }
  }

  const listen = (port: number, callback?: () => void) => {
    // 🔹 bootstrap всіх root модулів
    for (const mod of modules) {
      bootstrapModule(mod);
    }

    app.use(FiltersMiddleware());
    app.listen(port, callback);
  };

  app.use(router);

  return {
    get: container.resolve,
    listen,
    use: (path: string, handler: express.RequestHandler) => {
      app.use(path, handler);
    },
    useGlobalGuards: (guards: any[]) => {
      globalGuards.push(...guards);
    },
    useGlobalPipes: (pipes: any[]) => {
      globalPipes.push(...pipes);
    },
    useGlobalFilters: (filters: any[]) => {
      globalFilters.push(...filters);
    },
    useGlobalInterceptors: () => {
      throw new Error('Interceptors are not implemented yet');
    },
  };
}

// export function Factory(modules: any[]) {
//   // Створюємо Express-додато
//   const app = express();

//   // Парсер JSON body
//   app.use(express.json());

//   // Центральний роутер
//   const router = express.Router();

//   // Глобальні масиви для guards, pipes, filters
//   const globalGuards: Array<Type> = [];
//   const globalPipes: Array<Type> = [];
//   const globalFilters: Array<Type> = [];

//   // Метод для запуску сервера
//   const listen = (port: number, callback?: () => void) => {
//     // Перебираємо всі модулі, передані у фабрику
//     for (const mod of modules) {
//       // Читаємо метадані модуля
//       const meta = get('mini:module', mod);
//       if (!meta) continue;

//       // Перебираємо контролери модуля
//       for (const Ctl of meta.controllers ?? []) {

//         // Реєструємо контролер у контейнері DI
//         container.register(Ctl, Ctl)

//         // Читаємо префікс роута з metadata, якщо є
//         const prefix = get('mini:prefix', Ctl) ?? '';

//         // Читаємо маршрути контролера
//         const routes = get('mini:routes', Ctl) ?? [];

//         // Створюємо інстанс контролера через контейнер
//         const instance = container.resolve(Ctl) as InstanceType<typeof Ctl>;

//         // Навішуємо кожен роут
//         routes.forEach((r: any) => {
//           const handler = instance[r.handlerName] as (...args: any[]) => Promise<any>;

//           // Повний шлях = префікс + маршрут
//           const path = prefix + r.path;
//           console.log(`🌀 [Router] Registering route: [${r.method.toUpperCase()}] ${path} -> ${Ctl.name}.${r.handlerName}`);
//           // Підключаємо Express метод (get/post/put/...)
//           (router as any)[r.method](
//             path,
//             // Handler middleware для pipes / валідації
//             asyncHandler(HandlerMiddleware(instance, handler, globalPipes)),
//             // Guards middleware обертає handler
//             asyncHandler(GuardsMiddleware(Ctl, handler, globalGuards)),
//             // Filters middleware для обробки помилок
//             // asyncHandler(FiltersMiddleware(Ctl, handler, globalFilters)),
//           );
//         });
//       }
//     }
//     app.use(FiltersMiddleware());
//     // Запускаємо Express на порту
//     app.listen(port, callback);
//   }

//   // Підключаємо central router до app
//   app.use(router);

//   return {
//     // Отримати інстанс через container.resolve
//     get: container.resolve,

//     // Запуск сервера
//     listen,

//     // Додаткові middleware
//     use: (path: string, handler: express.RequestHandler) => {
//       app.use(path, handler);
//     },
//     // Глобальні guards, pipes & filters
//     useGlobalGuards: (guards: any[]) => {
//       globalGuards.push(...guards);
//     },
//     useGlobalPipes: (pipes: any[]) => {
//       globalPipes.push(...pipes);
//     },
//     useGlobalFilters: (filters: any[]) => {
//       globalFilters.push(...filters);
//     },
//     // TO DO =======> implement interceptors
//     useGlobalInterceptors: (interceptors: any[]) => {
//       throw new Error('Interceptors are not implemented yet');
//     },
//   }
// }