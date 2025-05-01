import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workout } from '../../entities/workout.entity';
import { WorkoutRepository } from './workout.repository';
import { WorkoutService } from './workout.service';
import { WorkoutResolver } from './workout.resolver';
import { XlsxModule } from '../xlsx/xlsx.module';
import { ExercisesModule } from '../exercise/exercise.module';
import { WorkoutExerciseModule } from '../workout-exercise/workout-exercise.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workout]),
    XlsxModule,
    ExercisesModule,
    WorkoutExerciseModule,
  ],
  providers: [WorkoutRepository, WorkoutService, WorkoutResolver],
  exports: [WorkoutService],
})
export class WorkoutModule {}
