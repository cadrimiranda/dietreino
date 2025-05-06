import { Module } from '@nestjs/common';
import { TrainingDayRepository } from './training-day.repository';
import { TrainingDayService } from './training-day.service';
import { TrainingDay } from '@/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingDay])],
  providers: [TrainingDayRepository, TrainingDayService],
  exports: [TrainingDayService],
})
export class TrainingDayModule {}
