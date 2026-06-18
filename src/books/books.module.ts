import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { Book } from '../entities/book.entity';
import { FileService } from './file/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([Book])],
  controllers: [BooksController],
  providers: [BooksService, FileService, CloudinaryProvider],
  exports: [BooksService],
})
export class BooksModule {}