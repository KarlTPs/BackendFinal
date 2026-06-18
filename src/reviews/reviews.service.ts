import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { Book } from '../entities/book.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async create(
    bookId: string,
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException('Libro no encontrado');
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { book: { id: bookId }, user: { id: userId } },
    });
    if (existingReview) {
      throw new ConflictException('Ya has dejado una reseña para este libro');
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      book: { id: bookId } as Book,
      user: { id: userId } as any,
    });

    return this.reviewRepository.save(review);
  }

  async findByBook(bookId: string): Promise<Review[]> {
    const bookExists = await this.bookRepository.exists({
      where: { id: bookId },
    });
    if (!bookExists) {
      throw new NotFoundException('Libro no encontrado');
    }

    return this.reviewRepository.find({
      where: { book: { id: bookId } },
      relations: ['user'],
      select: {
        user: { id: true, username: true }, // no exponer email/password del autor de la reseña
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'book'],
    });

    if (!review) {
      throw new NotFoundException('Reseña no encontrada');
    }

    return review;
  }

  async update(
    id: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.findOne(id);

    if (review.user.id !== userId) {
      throw new ForbiddenException('Solo puedes editar tus propias reseñas');
    }

    Object.assign(review, updateReviewDto);
    return this.reviewRepository.save(review);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const review = await this.findOne(id);

    const isOwner = review.user.id === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Solo puedes eliminar tus propias reseñas');
    }

    await this.reviewRepository.remove(review);
  }
}