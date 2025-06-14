import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutHistory } from '../../entities/workout-history.entity';
import { WorkoutHistoryExercise } from '../../entities/workout-history-exercise.entity';
import { WorkoutHistoryExerciseSet } from '../../entities/workout-history-exercise-set.entity';
import { WorkoutHistoryService } from './workout-history.service';
import { WorkoutHistoryResolver } from './workout-history.resolver';
import { WorkoutHistoryRepository } from './workout-history.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutHistory,
      WorkoutHistoryExercise,
      WorkoutHistoryExerciseSet,
    ]),
  ],
  providers: [
    WorkoutHistoryService,
    WorkoutHistoryResolver,
    WorkoutHistoryRepository,
  ],
  exports: [WorkoutHistoryService, WorkoutHistoryRepository],
})
export class WorkoutHistoryModule {}
