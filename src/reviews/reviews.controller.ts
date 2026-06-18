import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: string; username: string; role: string };
}

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post('books/:bookId/reviews')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Dejar una reseña en un libro' })
  @ApiResponse({ status: 201, description: 'Reseña creada', type: ReviewResponseDto })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe una reseña tuya para este libro' })
  create(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Request() req: AuthenticatedRequest,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(bookId, req.user.id, createReviewDto);
  }

  @Get('books/:bookId/reviews')
  @ApiOperation({ summary: 'Ver todas las reseñas de un libro' })
  @ApiResponse({ status: 200, description: 'Lista de reseñas', type: [ReviewResponseDto] })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  findByBook(@Param('bookId', ParseUUIDPipe) bookId: string) {
    return this.reviewsService.findByBook(bookId);
  }

  @Patch('reviews/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Editar tu propia reseña' })
  @ApiResponse({ status: 200, description: 'Reseña actualizada', type: ReviewResponseDto })
  @ApiResponse({ status: 403, description: 'No puedes editar reseñas de otros usuarios' })
  @ApiResponse({ status: 404, description: 'Reseña no encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, req.user.id, updateReviewDto);
  }

  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar tu propia reseña (o cualquiera si eres admin)' })
  @ApiResponse({ status: 204, description: 'Reseña eliminada' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para eliminar esta reseña' })
  @ApiResponse({ status: 404, description: 'Reseña no encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: AuthenticatedRequest) {
    return this.reviewsService.remove(id, req.user.id, req.user.role);
  }
}