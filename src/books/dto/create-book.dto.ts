import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'Cien años de soledad' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'Gabriel García Márquez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  author!: string;

  @ApiPropertyOptional({ example: 'La historia de la familia Buendía...' })
  @IsOptional()
  @IsString()
  synopsis?: string;

  @ApiPropertyOptional({ example: 'Realismo mágico' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  genre?: string;

  @ApiPropertyOptional({ example: '1967-05-30' })
  @IsOptional()
  @IsDateString()
  publicationDate?: string;
}