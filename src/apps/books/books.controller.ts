import { Body, Controller, Get, Param, Post, UseGuards, UsePipes } from "../../core/decorators";
import { createBooksSchema } from "./books.schema";
import { BooksService } from './books.service.js';
import { ZodValidationPipe } from "../pipes/zod.pipe";
import { Roles, RolesGuard } from "../guards/roles.guard";
import { z } from 'zod';

@Controller('/books')
// @UsePipes(new GlobalLoggingPipe())
@UseGuards(RolesGuard) // застосовуємо глобально до всіх методів контролера
export class BooksController {
  constructor(private svc: BooksService) { }

  @Post('/')
  // @Roles('superadmin')
  @UsePipes(new ZodValidationPipe(createBooksSchema))
  add(@Body() body: { title: string, author: string }) {
    return this.svc.create(body.title, body.author);
  }

  @Get('/')
  // @Roles('admin')
  list() {
    return this.svc.findAll();
  }

  @Get('/:id')
  // @Roles('user')
  @UsePipes(new ZodValidationPipe(z.string()))
  one(@Param('id') id: string) {
    return this.svc.findOne(+id);
  }
}