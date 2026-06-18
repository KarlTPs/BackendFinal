import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';
import { PaginatedBooksResponseDto } from './dto/paginated-books-response.dto';
import { Book } from '../entities/book.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { multerConfig } from 'config/multer.config';
import { BookDetailResponseDto } from './dto/book-detail-response.dto';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  @Get()
  @ApiOperation({ summary: 'Listar catálogo de libros con paginación y filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de libros',
    type: PaginatedBooksResponseDto,
  })
  findAll(@Query() query: QueryBooksDto) {
    return this.booksService.findAll(query);
  }

  @Get(':id')
    @ApiOperation({ summary: 'Obtener el detalle de un libro' })
    @ApiResponse({ status: 200, description: 'Detalle del libro con rating promedio', type: BookDetailResponseDto })
    @ApiResponse({ status: 404, description: 'Libro no encontrado' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.booksService.findOne(id);
    }

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Agregar un nuevo libro (solo admin)' })
  @ApiResponse({ status: 201, description: 'Libro creado', type: Book })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Modificar un libro existente (solo admin)' })
  @ApiResponse({ status: 200, description: 'Libro actualizado', type: Book })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un libro (solo admin)' })
  @ApiResponse({ status: 204, description: 'Libro eliminado' })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.remove(id);
  }

  @Post(':id/image')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Subir imagen de portada de un libro (solo admin)' })
  @ApiResponse({ status: 200, description: 'Portada actualizada', type: Book })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.booksService.uploadCoverImage(id, file);
  }
}