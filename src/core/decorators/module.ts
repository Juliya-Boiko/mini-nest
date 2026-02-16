// Декоратор модуля
export function Module(metadata: {
  imports?: any[];
  controllers?: any[];
  providers?: any[];
  exports?: any[];
}) {
  return function (target: any) {
    Reflect.defineMetadata('mini:module', metadata, target);
  };
}
