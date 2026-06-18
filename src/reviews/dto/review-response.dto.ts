import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id!: string;

  @ApiProperty({ example: 5 })
  rating!: number;

  @ApiProperty({ example: 'Una obra maestra del realismo mágico', nullable: true })
  comment!: string | null;

  @ApiProperty({ example: '2026-06-18T10:30:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: { id: 'uuid', username: 'juanperez' } })
  user!: { id: string; username: string };

  @ApiProperty({ example: { id: 'uuid', title: 'Cien años de soledad' } })
  book!: { id: string; title: string };
}