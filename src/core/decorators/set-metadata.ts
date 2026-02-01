// Тип кастомного декоратора
// Декоратор, який можна застосовувати і до класів, і до методів
// Додатково має поле KEY для збереження ключа metadata
export type CustomDecorator<TKey = string> = MethodDecorator & ClassDecorator & {
  KEY: TKey;
};

// Factory для створення кастомного декоратора
export const SetMetadata: <K = string, V = any>(metadataKey: K, metadataValue: V) => CustomDecorator<K> = (metadataKey, metadataValue) => {
  const df = (target: object, key?: any, descriptor?: any) => {
    // Якщо декоратор застосовано до методу (існує descriptor)
    if (descriptor) {
      // Зберігаємо metadata на функції (descriptor.value)
      Reflect.defineMetadata(metadataKey, metadataValue, descriptor.value);
      return descriptor;
    }
    // Якщо декоратор застосовано до класу
    Reflect.defineMetadata(metadataKey, metadataValue, target);
    return target;
  };

  // Додаємо KEY на сам декоратор для зручного доступу до ключа metadata
  df.KEY = metadataKey;
  return df;
}