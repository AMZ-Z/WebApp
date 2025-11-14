import { Controller, Delete, Get, Param, Post, Body } from '@nestjs/common';
import { CreateAuthorDto } from './author.dto';
import { AuthorService } from './author.service';

@Controller('authors')
export class AuthorController {
  constructor(private readonly service: AuthorService) {}

  @Get()
  list() {
    return this.service.getAllAuthors();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getAuthorDetails(id);
  }

  @Post()
  create(@Body() dto: CreateAuthorDto) {
    return this.service.createAuthor(dto);
  }

  // ✅ DELETE — remove an author
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteAuthor(id);
  }
}
