import { Type } from "../types";
import { ErrorRequestHandler } from "express";

// Middleware для обробки помилок (ExceptionFilter)
// Ctl — клас контролера, handler — метод, filters — масив класів filter-ів
export const FiltersMiddleware = (_Ctl: Type, _handler: Function, _filters: Array<Type>): ErrorRequestHandler => {
  //Here we assume that the filters are classes with a method `catch`
  return (err, _req, res, _next) => {
    err.stack = undefined;
    res.status((err as Error & { status: number }).status || 500).json({ error: err.message || 'Server error' });
  }
}