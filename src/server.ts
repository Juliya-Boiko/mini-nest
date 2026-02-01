// Підключаємо Reflect Metadata API для декораторів (TypeScript / NestJS / TypeORM)
import "reflect-metadata"

// Імпорт модуля BooksModule — містить контролери, сервіси, провайдери для роботи з книгами
import { BooksModule } from "./apps/books/books.module"

// Імпорт кастомної фабрики для створення HTTP-додатку (аналог NestFactory)
import { Factory } from "./core/http"

//catch uncaughtExceptio
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)

  // Handle the error or exit the process
  process.exit(1)
})

const app = Factory([BooksModule])

const port = 8081

// Запуск сервера
app.listen(port, () =>
  console.log(`✨ Mini-Nest listening on http://localhost:${port}`)
)