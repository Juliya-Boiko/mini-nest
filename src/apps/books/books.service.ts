import { Injectable } from "../../core/decorators";

export interface Book { id: number; title: string; author: string }

@Injectable()
export class BooksService {
  #data: Book[] = [{ id: 1, title: '1984', author: 'Orwell' }];

  findAll() { return this.#data; }

  findOne(id: number) { return this.#data.find(b => b.id === id); }

  create(title: string, author: string) {
    const book = { id: Date.now(), title, author };
    this.#data.push(book); return book;
  }
}