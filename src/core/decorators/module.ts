// Декоратор модуля
export function Module(metadata: { controllers?: any[]; providers?: any[]; exports?: any[]; }) {
  return function (target: any) {
    // Зберігаємо metadata на класі модуля
    Reflect.defineMetadata('mini:module', metadata, target);
  };
}