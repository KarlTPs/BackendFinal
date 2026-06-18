import { ApiProperty } from '@nestjs/swagger';

export class AffinityResultDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  userId!: string;

  @ApiProperty({ example: 'mariagomez' })
  username!: string;

  @ApiProperty({
    example: 0.92,
    description: 'Puntaje de similitud de coseno, entre 0 y 1',
  })
  affinityScore!: number;

  @ApiProperty({
    example: 4,
    description: 'Cantidad de libros reseñados en común',
  })
  sharedBooksCount!: number;
}