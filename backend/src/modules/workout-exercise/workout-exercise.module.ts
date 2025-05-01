import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutExercise } from '../../entities/workout-exercise.entity';
import { WorkoutExerciseService } from './workout-exercise.service';
import { WorkoutExerciseRepository } from './workout-exercise.repository';
import { WorkoutExerciseResolver } from './workout-exercise.resolver';
import { RepSchemeModule } from '../rep-scheme/rep-scheme.module';
import { RestIntervalModule } from '../rest-interval/rest-interval.module';
import { ExercisesModule } from '../exercise/exercise.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutExercise]),
    ExercisesModule,
    RepSchemeModule,
    RestIntervalModule,
  ],
  providers: [
    WorkoutExerciseService,
    WorkoutExerciseRepository,
    WorkoutExerciseResolver,
  ],
  exports: [WorkoutExerciseService],
})
export class WorkoutExerciseModule {}
