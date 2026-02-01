import { Request, Response } from "express";
import { ArgumentMetadata, Type } from "../types";
import { extractParams, get } from "../utils";
import { runPipes } from "../decorators";

// Кастомна помилка для pipe
class PipeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PipeError";
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
      throw new PipeError(`Pipe error for: ${error.message}`);
    }
  }

  return args;
}

// Middleware для виконання handler-а
export const HandlerMiddleware = (instance: Type, handler: Function, globalPipes: Array<Type>) => {
  return async (req: Request, res: Response) => {
    const args = await getHandlerArgs(instance.constructor, handler, req, globalPipes);

    const result = await handler.apply(instance, args);
    res.json(result);
  }
}