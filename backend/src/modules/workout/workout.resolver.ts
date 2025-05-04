import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-minimal';

import { WorkoutService } from './workout.service';
import { WorkoutType } from './workout.type';
import { CreateWorkoutInput } from './dto/create-workout.input';
import { UpdateWorkoutInput } from './dto/update-workout.input';
import { Workout } from '../../entities/workout.entity';
import { UseGuards } from '@nestjs/common';
import { UserRole } from '../../utils/roles.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ImportSheetWorkoutInput } from './dto/import-sheet-workout.input';
import { WorkoutExerciseType } from '../workout-exercise/dto/workout-exercise.type';
import { WorkoutExerciseService } from '../workout-exercise/workout-exercise.service';
import { ImportXlsxUserWorkoutInput } from './dto/import-xlsx-user-workout-input';

@Resolver(() => WorkoutType)
export class WorkoutResolver {
  constructor(
    private readonly workoutService: WorkoutService,
    private readonly workoutExerciseService: WorkoutExerciseService,
  ) {}

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  @Query(() => [WorkoutType])
  async workouts(): Promise<Partial<WorkoutType>[]> {
    const entities = await this.workoutService.findAll();
    return entities.map(this.workoutService.toWorkoutType);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  @Query(() => WorkoutType, { nullable: true })
  async workout(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<Partial<WorkoutType> | null> {
    const entity = await this.workoutService.findById(id);
    return entity ? this.workoutService.toWorkoutType(entity) : null;
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER)
  @Mutation(() => WorkoutType, { nullable: true })
  async updateWorkout(
    @Args('updateWorkoutInput') input: UpdateWorkoutInput,
  ): Promise<Partial<WorkoutType> | null> {
    const updateData: Partial<Workout> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.weekStart !== undefined) updateData.week_start = input.weekStart;
    if (input.weekEnd !== undefined) updateData.week_end = input.weekEnd;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    const entity = await this.workoutService.update(
      Number(input.id),
      updateData,
    );
    return entity ? this.workoutService.toWorkoutType(entity) : null;
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER)
  @Mutation(() => Boolean)
  async deleteWorkout(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<boolean> {
    await this.workoutService.delete(id);
    return true;
  }

  @Mutation(() => WorkoutType)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER)
  async importXlsxAndCreateWorkout(
    @Args('input') input: ImportXlsxUserWorkoutInput,
  ) {
    return this.workoutService.importXlsxUserWorkout(input);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  @ResolveField('workoutExercises', () => [WorkoutExerciseType], {
    nullable: true,
  })
  async resolveWorkoutExercises(@Parent() workout: Workout) {
    return this.workoutExerciseService.findByWorkoutId(workout.id);
  }
}
