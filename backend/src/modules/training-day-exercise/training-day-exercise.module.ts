import { Module } from '@nestjs/common';
import { TrainingDayExerciseRepository } from './training-day-exercise.repository';
import { TrainingDayExerciseService } from './training-day-exercise.service';
import { TrainingDayExercise } from '@/entities';
import { ExercisesModule } from '../exercise/exercise.module';
import { RepSchemeModule } from '../rep-scheme/rep-scheme.module';
import { RestIntervalModule } from '../rest-interval/rest-interval.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainingDayExercise]),
    ExercisesModule,
    RepSchemeModule,
    RestIntervalModule,
  ],
  providers: [TrainingDayExerciseRepository, TrainingDayExerciseService],
  exports: [TrainingDayExerciseService],
})
export class TrainingDayExerciseModule {}
