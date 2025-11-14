import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorEntity } from './author.entity';
import type { AuthorModel, AuthorDetailsModel, CreateAuthorModel, UpdateAuthorModel } from './author.model';

function mapEntity(a: AuthorEntity): AuthorModel {
  return {
    id: a.id,
    firstName: a.firstName,
    lastName: a.lastName,
    photoUrl: a.photoUrl ?? undefined,
  };
}

@Injectable()
export class AuthorRepository {
  constructor(
    @InjectRepository(AuthorEntity)
    private readonly authorRepository: Repository<AuthorEntity>,
  ) {}

  public async getAllAuthors(): Promise<AuthorModel[]> {
    const rows = await this.authorRepository.find();
    return rows.map(mapEntity);
  }

  public async getAuthorDetails(id: string): Promise<AuthorDetailsModel | null> {
    const a = await this.authorRepository.findOne({ where: { id: id as any } });
    if (!a) return null;
    return {
      ...mapEntity(a),
      booksCount: 0,
      averageSales: 0,
    };
  }

  public async createAuthor(author: CreateAuthorModel): Promise<AuthorModel> {
    const entity = this.authorRepository.create({
      firstName: author.firstName,
      lastName: author.lastName,
      photoUrl: author.photoUrl ?? undefined,
    });
    const saved = await this.authorRepository.save(entity);
    return mapEntity(saved);
  }

  public async updateAuthor(id: string, input: UpdateAuthorModel): Promise<AuthorModel> {
    const partial: Partial<AuthorEntity> = {};
    if (typeof input.firstName === 'string') partial.firstName = input.firstName;
    if (typeof input.lastName === 'string') partial.lastName = input.lastName;
    if (input.photoUrl !== undefined) partial.photoUrl = input.photoUrl ?? null;

    await this.authorRepository.update({ id: id as any }, partial);
    const updated = await this.authorRepository.findOne({ where: { id: id as any } });
    if (!updated) throw new Error('Author not found');
    return mapEntity(updated);
  }

  public async deleteAuthor(id: string): Promise<void> {
    await this.authorRepository.delete({ id: id as any });
  }
}
