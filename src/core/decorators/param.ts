import { ArgumentMetadata } from "../types";

// Декоратор для витягування route-параметра
export function Param(data?: string) {
  return function (target: any, name: string, idx: number) {
    // Отримуємо тип параметра через Reflect Metadata
    const ps = Reflect.getMetadata('design:paramtypes', target, name) ?? [];
    const metatype = ps[idx];
    // Iснуючі параметри метадані для цього контролера
    const params: Array<ArgumentMetadata> =
      Reflect.getMetadata('mini:params', target.constructor) ?? [];
    // Додаємо metadata для цього параметра
    params.push({ index: idx, metatype, type: 'param', data, name });
    // Зберігаємо оновлені metadata назад на клас
    Reflect.defineMetadata('mini:params', params, target.constructor);
  };
}

export function Body() {
  return function (target: any, name: string, idx: number) {
    const ps = Reflect.getMetadata('design:paramtypes', target, name) ?? [];
    const metatype = ps[idx];
    const params: Array<ArgumentMetadata> =
      Reflect.getMetadata('mini:params', target.constructor) ?? [];
    params.push({ index: idx, type: 'body', metatype, name });
    Reflect.defineMetadata('mini:params', params, target.constructor);
  };
}

export function Query(data: string) {
  return function (target: any, name: string, idx: number) {
    const ps = Reflect.getMetadata('design:paramtypes', target, name) ?? [];
    const metatype = ps[idx];
    const params: Array<ArgumentMetadata> =
      Reflect.getMetadata('mini:params', target.constructor) ?? [];
    params.push({ index: idx, type: 'query', metatype, data, name });
    Reflect.defineMetadata('mini:params', params, target.constructor);
  };
}