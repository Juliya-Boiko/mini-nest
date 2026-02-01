import { ZodSchema } from 'zod';
import { ArgumentMetadata } from "../../core/types";
import { PipeTransform } from "../../core/decorators";

export class ZodValidationPipe implements PipeTransform<any, any> {
  constructor(
    private readonly schema: ZodSchema
  ) { }

  transform(value: unknown, meta: ArgumentMetadata) {
    try {
      return this.schema.parse(value);        // ✅ OK – повертаємо чисті дані
    } catch (err: any) {
      /*  ↳ у продакшн-коді краще кидати свій HttpError із статусом 400   */
      // throw new Error(
      //   `Validation failed for ${meta.type}${meta.data ? ` (${meta.data})` : ''}`
      // );
      const error: any = new Error(
        `Validation failed for ${meta.type}${meta.data ? ` (${meta.data})` : ''}`
      );
      error.status = 400; // HTTP 400
      throw error;
    }
  }
}