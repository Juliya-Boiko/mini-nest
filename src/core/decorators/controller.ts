// Декоратор контролера
// prefix — опціональний префікс роута
export function Controller(prefix = '') {
  return function (target: any) {
    // Зберігаємо metadata "mini:prefix" на класі
    Reflect.defineMetadata('mini:prefix', prefix, target);
  };
}

// Функція для перевірки, чи клас є контролером
export const isController = (target: any) => {
  return Reflect.hasMetadata('mini:prefix', target);
}