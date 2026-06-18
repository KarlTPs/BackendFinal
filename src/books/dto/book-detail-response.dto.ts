import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../../entities/book.entity';

export class BookDetailResponseDto extends Book {
  @ApiProperty({ example: 4.3, description: 'Promedio de calificaciones (1-5)', nullable: true })
  averageRating!: number | null;

  @ApiProperty({ example: 12, description: 'Cantidad total de reseñas' })
  reviewsCount!: number;
}