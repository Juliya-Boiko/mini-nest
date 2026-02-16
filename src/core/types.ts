import { Paramtype } from "./utils";
import { PipeTransform } from "./decorators";
export interface Type<T = any> extends Function {
  new(...args: any[]): T;
}

export interface ArgumentMetadata {
  readonly index: number;         // позиція аргументу у методі
  readonly type: Paramtype;            // де “живе” значення
  readonly metatype?: Type            // його TS-тип (якщо є)
  readonly data?: string;             // @Body('userId') → 'userId'
  readonly name?: string;             // ім'я функції-методу, якщо декоратор використовується на методі
  readonly pipes?: Array<Type<PipeTransform> | PipeTransform>;
}