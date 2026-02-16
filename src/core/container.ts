// Reflect.getMetadata, щоб отримувати типи параметрів конструктора
import 'reflect-metadata';
import { INJECT_METADATA_KEY } from './decorators/inject';

type Token = string | symbol | Function;

export class Container {
  // token → клас (provider)
  #registered = new Map<Token, any>();

  // token → singleton instance
  #singletons = new Map<Token, any>();

  /**
   * Отримання інстансу по токену
   */
  resolve<T>(token: Token): T {
    // 1️⃣ Якщо singleton вже існує — повертаємо
    if (this.#singletons.has(token)) {
      return this.#singletons.get(token);
    }

    // 2️⃣ Отримуємо клас-провайдер
    const target = this.#registered.get(token);

    if (!target) {
      throw new Error(`Token ${String(token)} is not registered.`);
    }

    // 3️⃣ Отримуємо типи параметрів конструктора
    const paramTypes: any[] =
      Reflect.getMetadata('design:paramtypes', target) || [];

    // 4️⃣ Отримуємо кастомні токени з @Inject()
    const injectTokens =
      Reflect.getMetadata(INJECT_METADATA_KEY, target) || {};

    // 5️⃣ Резолв залежностей
    const dependencies = paramTypes.map((paramType, index) => {
      const customToken = injectTokens[index];
      const dependencyToken = customToken || paramType;

      if (dependencyToken === token) {
        throw new Error(
          `Circular dependency detected for token ${String(token)}`
        );
      }

      return this.resolve(dependencyToken);
    });

    // 6️⃣ Створюємо інстанс
    const instance = new target(...dependencies);

    // 7️⃣ Зберігаємо як singleton
    this.#singletons.set(token, instance);

    return instance;
  }

  /**
   * Реєстрація провайдера
   */
  register(token: Token, provider: any): void {
    if (this.#registered.has(token)) {
      throw new Error(`Token ${String(token)} is already registered.`);
    }

    this.#registered.set(token, provider);
  }
}

export const container = new Container();