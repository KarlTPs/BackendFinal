import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { User } from '../entities/user.entity';
import { Review } from '../entities/review.entity';
import { AffinityService } from './affinity/affinity.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Review])],
  controllers: [UsersController],
  providers: [UsersService, AffinityService],
  exports: [UsersService],
})
export class UsersModule {}