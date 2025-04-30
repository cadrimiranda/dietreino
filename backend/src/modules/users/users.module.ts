import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersResolver } from './users.resolver';
import { WorkoutModule } from '../workout/workout.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), WorkoutModule],
  providers: [UsersService, UsersRepository, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
