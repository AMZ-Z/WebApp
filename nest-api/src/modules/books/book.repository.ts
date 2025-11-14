import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsOrder } from 'typeorm';
import { BookEntity, type BookId } from './entities/book.entity';
import { AuthorEntity, type AuthorId } from '../authors/author.entity';
import type {
  BookModel,
  CreateBookModel,
  UpdateBookModel,
  FilterBooksModel,
  BookDetailsModel,
  BookBuyerRow,
} from './book.model';

function makeOrder(sort?: string): FindOptionsOrder<BookEntity> | undefined {
  if (!sort) return undefined;
  const [fieldRaw, dirRaw] = sort.split(',');
  const field = (fieldRaw ?? '').trim();
  const dir = (dirRaw ?? 'ASC').trim().toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  if (!field) return undefined;
  return { [field]: dir } as FindOptionsOrder<BookEntity>;
}

function mapEntity(b: BookEntity): BookModel {
  return {
    id: b.id as string,
    title: b.title,
    authorId: (b.authorId as unknown as string) ?? (b.author?.id as unknown as string),
    yearPublished: b.yearPublished,
    photoUrl: b.photoUrl ?? undefined,
  };
}

@Injectable()
export class BookRepository {
  constructor(
    @InjectRepository(BookEntity)
    private readonly repo: Repository<BookEntity>,
  ) {}

  /** Compatibility with existing service expecting getAllBooks(FilterBooksModel) */
  public async getAllBooks(input: FilterBooksModel): Promise<BookModel[]> {
    return this.listBooks(input);
  }

  /** List with pagination/sort */
  public async listBooks(input: FilterBooksModel): Promise<BookModel[]> {
    const items = await this.repo.find({
      relations: ['author'],
      take: input.limit,
      skip: input.offset,
      order: makeOrder(input.sort),
    });
    return items.map(mapEntity);
  }

  public async listBooksWithCounts(): Promise<BookModel[]> {
    const items = await this.repo.find({ relations: ['author'] });
    return items.map(mapEntity);
  }

  public async getBookById(id: string): Promise<BookModel | undefined> {
    const b = await this.repo.findOne({ where: { id: id as BookId }, relations: ['author'] });
    return b ? mapEntity(b) : undefined;
  }

  public async getBookDetails(id: string): Promise<BookDetailsModel | null> {
    const b = await this.repo.findOne({ where: { id: id as BookId }, relations: ['author'] });
    if (!b) return null;
    const details: BookDetailsModel = {
      id: b.id as string,
      title: b.title,
      yearPublished: b.yearPublished,
      photoUrl: b.photoUrl ?? undefined,
      author: {
        id: (b.authorId as unknown as string) ?? (b.author?.id as unknown as string),
        firstName: b.author?.firstName ?? '',
        lastName: b.author?.lastName ?? '',
      },
      buyers: [] as BookBuyerRow[],
      buyersCount: 0,
    };
    return details;
  }

  public async createBook(book: CreateBookModel): Promise<BookModel> {
    const entity = this.repo.create({
      title: book.title,
      yearPublished: book.yearPublished,
      photoUrl: book.photoUrl,
      authorId: book.authorId as unknown as AuthorId,
    } as Partial<BookEntity>);
    const saved = await this.repo.save(entity);
    // re-load with relations to ensure mapping consistency
    const reloaded = await this.repo.findOne({ where: { id: saved.id }, relations: ['author'] });
    return mapEntity(reloaded ?? saved);
  }

  public async updateBook(id: string, input: UpdateBookModel): Promise<BookModel> {
    const partial: Partial<BookEntity> = {};
    if (typeof input.title === 'string') partial.title = input.title;
    if (typeof input.yearPublished === 'number') partial.yearPublished = input.yearPublished;
    if (typeof input.photoUrl === 'string' || input.photoUrl === null) partial.photoUrl = input.photoUrl ?? undefined;
    if (typeof input.authorId === 'string') partial.authorId = input.authorId as unknown as AuthorId;

    await this.repo.update({ id: id as BookId }, partial);
    const updated = await this.repo.findOne({ where: { id: id as BookId }, relations: ['author'] });
    if (!updated) {
      throw new Error('Book not found');
    }
    return mapEntity(updated);
  }

  public async deleteBook(id: string): Promise<void> {
    await this.repo.delete({ id: id as BookId });
  }
}
