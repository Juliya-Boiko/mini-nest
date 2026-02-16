import { Request, Response, NextFunction } from "express";
import { ArgumentMetadata, Type } from "../types";
import { extractParams, get } from "../utils";
import { runPipes } from "../decorators";

// Кастомна помилка для pipe
class PipeError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PipeError";
    this.status = status;
  }
}

// Формування аргументів handler-а
const getHandlerArgs = async (Ctl: Function, handler: Function, req: Request, globalPipes: Array<Type>) => {
  // Отримуємо всі параметри контролера з метаданих
  const paramMeta: Array<ArgumentMetadata> = get('mini:params', Ctl) ?? [];

  // Фільтруємо лише параметри для конкретного handler-а
  const methodMeta: Array<ArgumentMetadata> = paramMeta
    .filter(m => m.name === handler.name);

  // Сортуємо по index, щоб args[i] були на правильній позиції
  const sortedMeta = [...methodMeta].sort((a, b) => a.index - b.index);
  const args: any[] = [];
  for (const metadata of sortedMeta) {
    // Витягаємо значення з request (body, params, query)
    const extracted = extractParams(req, metadata.type);
    const argument = metadata.data ? extracted[metadata.data] : extracted;

    try {
      // Пропускаємо через pipes (transform, validation)
      args[metadata.index] = await runPipes(Ctl, handler, argument, metadata, globalPipes);
    } catch (error: any) {
      throw new PipeError(
        `Pipe error for: ${error.message}`,
        error.status ?? 400
      );
    }
  }

  return args;
}

// Middleware для виконання handler-а
export const HandlerMiddleware = (instance: Type, handler: Function, globalPipes: Array<Type>) => {
  // return async (req: Request, res: Response) => {
  //   const args = await getHandlerArgs(instance.constructor, handler, req, globalPipes);

  //   const result = await handler.apply(instance, args);
  //   res.json(result);
  // }
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const args = await getHandlerArgs(instance.constructor, handler, req, globalPipes);
      const result = await handler.apply(instance, args);
      res.json(result);
    } catch (err) {
      next(err); // ⚠ crucial: pass error to next middleware
    }
  };
}