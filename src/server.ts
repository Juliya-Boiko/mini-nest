// Підключаємо Reflect Metadata API для декораторів (TypeScript / NestJS / TypeORM)
import "reflect-metadata"

// Імпорт модуля BooksModule — містить контролери, сервіси, провайдери для роботи з книгами
import { BooksModule } from "./apps/books/books.module"
import { BooksService } from "./apps/books/books.service";
import { LoggerService } from "./core/providers/logger";
// Імпорт кастомної фабрики для створення HTTP-додатку (аналог NestFactory)
import { Factory } from "./core/http"
import { container } from "./core/container";

//catch uncaughtExceptio
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)

  // Handle the error or exit the process
  process.exit(1)
})

try {
  // 1️⃣ Перевірка singleton LoggerService
  // const logger1 = container.resolve(LoggerService);
  // const logger2 = container.resolve(LoggerService);
  // console.log("💬 LoggerService singleton?", logger1 === logger2);

  // 2️⃣ Перевірка singleton BooksService + транзитивна залежність LoggerService
  // const books1 = container.resolve(BooksService);
  // const books2 = container.resolve(BooksService);
  // console.log("💬 BooksService singleton?", books1 === books2);
  // console.log("💬 Logger injected in BooksService?", books1["logger"] === logger1);

  // 3️⃣ Пробний виклик метода сервісу
  // console.log("💬 BooksService.findAll() test:", books1.findAll());

} catch (err) {
  console.error("DI Container test failed:", err);
}

const app = Factory([BooksModule])

const port = 8081

// Запуск сервера
app.listen(port, () =>
  console.log(`✨ Mini-Nest listening on http://localhost:${port}`)
)