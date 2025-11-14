import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { CreateAuthorDto, UpdateAuthorDto } from './author.dto';
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

    // ✅ PATCH — update an existing author
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateAuthorDto) {
      return this.service.updateAuthor(id, dto);
    }


  // ✅ DELETE — remove an author
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteAuthor(id);
  }
}
