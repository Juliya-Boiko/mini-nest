type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

export function Route(method: Method, path = '') {
  return function (target: any, key: string) {
    // Iснуючі маршрути метадані контролера або пустий масив
    const routes =
      Reflect.getMetadata('mini:routes', target.constructor) ?? [];
    // Додаємо новий маршрут
    routes.push({ method, path, handlerName: key });
    // Зберігаємо оновлені metadata назад на клас
    Reflect.defineMetadata('mini:routes', routes, target.constructor);
  };
}

// Прості шорткати
export const Get = (p = '') => Route('get', p);
export const Post = (p = '') => Route('post', p);