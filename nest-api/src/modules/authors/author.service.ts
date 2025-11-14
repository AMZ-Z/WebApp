import { Injectable } from '@nestjs/common';
import type { AuthorModel, AuthorDetailsModel, CreateAuthorModel, UpdateAuthorModel } from './author.model';
import { AuthorRepository } from './author.repository';

@Injectable()
export class AuthorService {
  constructor(private readonly authorRepository: AuthorRepository) {}

  public async getAllAuthors(): Promise<AuthorModel[]> {
    return this.authorRepository.getAllAuthors();
  }

  public async getAuthorDetails(id: string): Promise<AuthorDetailsModel | null> {
    return this.authorRepository.getAuthorDetails(id);
  }

  public async createAuthor(author: CreateAuthorModel): Promise<AuthorModel> {
    return this.authorRepository.createAuthor(author);
  }

  public async updateAuthor(id: string, input: UpdateAuthorModel): Promise<AuthorModel> {
    return this.authorRepository.updateAuthor(id, input);
  }

  public async deleteAuthor(id: string): Promise<void> {
    return this.authorRepository.deleteAuthor(id);
  }
}
