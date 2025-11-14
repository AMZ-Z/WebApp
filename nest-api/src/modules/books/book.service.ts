import { Injectable } from '@nestjs/common';
import { BookRepository } from './book.repository';
import type {
  BookModel,
  BookDetailsModel,
  CreateBookModel,
  UpdateBookModel,
  FilterBooksModel,
} from './book.model';

@Injectable()
export class BookService {
  constructor(private readonly repo: BookRepository) {}

  public async listBooks(): Promise<BookModel[]> {
    // Pas besoin d'argument ici — on peut exposer directement listBooksWithCounts()
    return this.repo.listBooksWithCounts();
  }

  public async getBookDetails(id: string): Promise<BookDetailsModel | null> {
    return this.repo.getBookDetails(id);
  }

  public async createBook(input: CreateBookModel): Promise<BookModel> {
    return this.repo.createBook(input);
  }

  public async updateBook(id: string, input: UpdateBookModel): Promise<BookModel> {
    return this.repo.updateBook(id, input);
  }

  public async deleteBook(id: string): Promise<void> {
    return this.repo.deleteBook(id);
  }
}
