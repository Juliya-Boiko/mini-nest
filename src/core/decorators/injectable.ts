import { container } from "../container";

// Декоратор для injectable сервісів
export function Injectable() {
  return function (target: any) {
    // Реєструємо клас у контейнері
    container.register(target, target)
  };
}