import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutExercise } from '../../entities/workout-exercise.entity';
import { WorkoutExerciseService } from './workout-exercise.service';
import { WorkoutExerciseRepository } from './workout-exercise.repository';
import { WorkoutExerciseResolver } from './workout-exercise.resolver';
import { RepScheme } from '../../entities/rep-scheme.entity';
import { RestInterval } from '../../entities/rest-interval.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutExercise, RepScheme, RestInterval]),
  ],
  providers: [
    WorkoutExerciseService,
    WorkoutExerciseRepository,
    WorkoutExerciseResolver,
  ],
  exports: [WorkoutExerciseService],
})
export class WorkoutExerciseModule {}
