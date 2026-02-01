import { Injectable } from "../../core/decorators";
import { LoggerService } from "../../core/providers/logger";
import { HttpException } from "../../core/exceptions/http-exception";

export interface Book { id: number; title: string; author: string }

@Injectable()
export class BooksService {
  #data: Book[] = [{ id: 1, title: '1984', author: 'Orwell' }];

  constructor(private logger: LoggerService) { } // type-based DI

  findAll() {
    this.logger.log('Fetching all books');
    return this.#data;
  }

  findOne(id: number) {
    this.logger.log(`Fetching book with id=${id}`);
    const book = this.#data.find(b => b.id === id)
    if (!book) {
      throw new HttpException(`Book with id=${id} not found`, 404);
    }
    return book;
  }

  create(title: string, author: string) {
    const book = { id: Date.now(), title, author };
    this.#data.push(book);
    this.logger.log(`Created book: ${title}`);
    return book;
  }
}