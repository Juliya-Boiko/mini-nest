// Reflect.getMetadata, щоб отримувати типи параметрів конструктора
import 'reflect-metadata';

export class Container {
  // Зареєстровані класи (token → клас)
  #registered = new Map();
  // Інстанси singleton (token → instance)
  #singletons = new Map();

  // resolve(token) — отримати інстанс класу
  resolve<T>(token: new (...args: any[]) => T): T {
    // Якщо singleton вже створений, повертаємо його
    if (this.#singletons.has(token)) return this.#singletons.get(token);

    // Отримуємо клас з реєстрації
    const cs = this.#registered.get(token);
    if (!cs) {
      throw new Error(`Token ${token.name} is not registered.`);
    }

    // Отримуємо metadata про типи параметрів конструктора
    const deps: any[] = Reflect.getMetadata("design:paramtypes", token) || [];

    const resolved = new cs(...deps.map(d => {
      if (d === token) {
        throw new Error(`Circular dependency detected for token ${token.name}.`);
      }

      return this.resolve(d)
    }));

    // Зберігаємо singleton
    this.#singletons.set(token, resolved);
    return resolved;
  }

  // Реєстрація класу в контейнері
  register<T extends Function>(token: T, member: T): void {
    // Перевірка на дублікати
    if (this.#registered.has(token)) {
      throw new Error(`Token ${token.name} is already registered.`);
    }

    this.#registered.set(token, member);
  }
}

export const container = new Container();