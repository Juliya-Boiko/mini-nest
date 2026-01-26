import "reflect-metadata"
import { BooksModule } from "./apps/books/books.module";
import { Factory } from "./core/http";

//catch uncaughtException
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Handle the error or exit the process
  process.exit(1); // Uncomment to exit the process
});

const app = Factory([BooksModule])

const port = 8081;

app.listen(port, () => console.log(`✨ Mini-Nest listening on http://localhost:${port}`));