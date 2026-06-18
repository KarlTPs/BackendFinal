import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserProfileDto } from './dto/user-profile.dto';
import { AffinityResultDto } from './dto/affinity-result.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';
import { AffinityService } from './affinity/affinity.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; username: string; role: string };
}

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private affinityService: AffinityService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.usersService.findProfile(req.user.id);
  }

  @Get('affinity')
  @ApiOperation({
    summary:
      'Obtener los usuarios más afines al usuario autenticado, según similitud de gustos en reseñas',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad máxima de resultados (default: 5)',
  })
  @ApiResponse({
    status: 200,
    description: 'Top de usuarios más afines',
    type: [AffinityResultDto],
  })
  getAffinity(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 5;
    return this.affinityService.getTopAffinities(req.user.id, parsedLimit);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Obtener las reseñas escritas por un usuario específico' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de reseñas del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getUserReviews(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findUserReviews(id);
  }
}