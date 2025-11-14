import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateBookDto, UpdateBookDto } from './book.dto';
import { BookService } from './book.service';

@Controller('books')
export class BookController {
  constructor(private readonly service: BookService) {}

  @Get()
  list() {
    return this.service.listBooks();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getBookDetails(id);
  }

  @Post()
  create(@Body() dto: CreateBookDto) {
    return this.service.createBook(dto);
  }

  // ✅ PATCH — update an existing book
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.service.updateBook(id, dto);
  }

  // ✅ DELETE — remove a book
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteBook(id);
  }
}
