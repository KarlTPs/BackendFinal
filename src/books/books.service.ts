import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Book } from '../entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';
import { PaginatedBooksResponseDto } from './dto/paginated-books-response.dto';
import { FileService } from './file/file.service';
import { BookDetailResponseDto } from './dto/book-detail-response.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    private fileService: FileService,
  ) {}

  async findAll(query: QueryBooksDto): Promise<PaginatedBooksResponseDto> {
    const { page = 1, limit = 10, title, author, genre } = query;

    const where: Record<string, unknown> = {};
    if (title) where.title = Like(`%${title}%`);
    if (author) where.author = Like(`%${author}%`);
    if (genre) where.genre = genre; // filtro exacto, no parcial

    const [data, total] = await this.bookRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<BookDetailResponseDto> {
  const book = await this.bookRepository.findOne({
    where: { id },
    relations: ['reviews', 'reviews.user'],
  });

  if (!book) {
    throw new NotFoundException('Libro no encontrado');
  }

  const result = await this.bookRepository
    .createQueryBuilder('book')
    .leftJoin('book.reviews', 'review')
    .select('AVG(review.rating)', 'averageRating')
    .addSelect('COUNT(review.id)', 'reviewsCount')
    .where('book.id = :id', { id })
    .getRawOne<{ averageRating: string | null; reviewsCount: string }>();

  return {
    ...book,
    averageRating: result?.averageRating
      ? Math.round(parseFloat(result.averageRating) * 10) / 10
      : null,
    reviewsCount: result ? parseInt(result.reviewsCount, 10) : 0,
  };
}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = this.bookRepository.create(createBookDto);
    return this.bookRepository.save(book);
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);
    Object.assign(book, updateBookDto);
    return this.bookRepository.save(book);
  }

  async remove(id: string): Promise<void> {
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
  }

  async uploadCoverImage(id: string, file: Express.Multer.File): Promise<Book> {
    const book = await this.findOne(id);
    const { url } = await this.fileService.uploadCoverImage(file);
    book.coverImage = url;
    return this.bookRepository.save(book);
  }
}