import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../../entities/book.entity';

export class PaginatedBooksResponseDto {
  @ApiProperty({ type: [Book] })
  data!: Book[];

  @ApiProperty({ example: 42, description: 'Total de libros que coinciden con el filtro' })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 5, description: 'Total de páginas disponibles' })
  totalPages!: number;
}