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
  // Створюємо Express-додато
  const app = express();

  // Парсер JSON body
  app.use(express.json());

  // Центральний роутер
  const router = express.Router();

  // Глобальні масиви для guards, pipes, filters
  const globalGuards: Array<Type> = [];
  const globalPipes: Array<Type> = [];
  const globalFilters: Array<Type> = [];

  // Метод для запуску сервера
  const listen = (port: number, callback?: () => void) => {
    // Перебираємо всі модулі, передані у фабрику
    for (const mod of modules) {
      // Читаємо метадані модуля
      const meta = get('mini:module', mod);
      if (!meta) continue;

      // Перебираємо контролери модуля
      for (const Ctl of meta.controllers ?? []) {

        // Реєструємо контролер у контейнері DI
        container.register(Ctl, Ctl)

        // Читаємо префікс роута з metadata, якщо є
        const prefix = get('mini:prefix', Ctl) ?? '';

        // Читаємо маршрути контролера
        const routes = get('mini:routes', Ctl) ?? [];

        // Створюємо інстанс контролера через контейнер
        const instance = container.resolve(Ctl) as InstanceType<typeof Ctl>;

        // Навішуємо кожен роут
        routes.forEach((r: any) => {
          const handler = instance[r.handlerName] as (...args: any[]) => Promise<any>;

          // Повний шлях = префікс + маршрут
          const path = prefix + r.path;

          // Підключаємо Express метод (get/post/put/...)
          (router as any)[r.method](
            path,
            // Guards middleware обертає handler
            asyncHandler(GuardsMiddleware(Ctl, handler, globalGuards)),
            // Handler middleware для pipes / валідації
            asyncHandler(HandlerMiddleware(instance, handler, globalPipes)),
            // Filters middleware для обробки помилок
            asyncHandler(FiltersMiddleware(Ctl, handler, globalFilters)),
          );
        });
      }
    }

    // Запускаємо Express на порту
    app.listen(port, callback);
  }

  // Підключаємо central router до app
  app.use(router);

  return {
    // Отримати інстанс через container.resolve
    get: container.resolve,

    // Запуск сервера
    listen,

    // Додаткові middleware
    use: (path: string, handler: express.RequestHandler) => {
      app.use(path, handler);
    },
    // Глобальні guards, pipes & filters
    useGlobalGuards: (guards: any[]) => {
      globalGuards.push(...guards);
    },
    useGlobalPipes: (pipes: any[]) => {
      globalPipes.push(...pipes);
    },
    useGlobalFilters: (filters: any[]) => {
      globalFilters.push(...filters);
    },
    // TO DO =======> implement interceptors
    useGlobalInterceptors: (interceptors: any[]) => {
      throw new Error('Interceptors are not implemented yet');
    },
  }
}