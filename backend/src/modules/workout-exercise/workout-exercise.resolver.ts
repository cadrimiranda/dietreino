import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { WorkoutExerciseService } from './workout-exercise.service';
import { WorkoutExerciseType } from './dto/workout-exercise.type';
import { WorkoutExercise } from '../../entities/workout-exercise.entity';
import { ExerciseType } from '../exercise/dto/exercise.type';
import { ExerciseService } from '../exercise/exercise.service';
import { RepSchemeService } from '../rep-scheme/rep-scheme.service';
import { RestIntervalService } from '../rest-interval/rest-interval.service';
import { RepSchemeType } from '../rep-scheme/dto/rep-scheme.type';
import { RestIntervalType } from '../rest-interval/dto/rest-interval.type';

@Resolver(() => WorkoutExerciseType)
export class WorkoutExerciseResolver {
  constructor(
    private readonly service: WorkoutExerciseService,
    private readonly exerciseService: ExerciseService,
    private readonly repSchemeService: RepSchemeService,
    private readonly restIntervalService: RestIntervalService,
  ) {}

  private toType = (entity: WorkoutExercise): WorkoutExerciseType => {
    return {
      id: entity.id,
      order: entity.order,
      sets: entity.sets,
      notes: entity.notes,

      exercise: {
        id: entity.exercise.id,
        name: entity.exercise.name,
        muscleGroup: entity.exercise.muscle_group,
        videoLink: entity.exercise.video_link,
      },
      repSchemes: [],
      restIntervals: [],
    };
  };

  @Query(() => [WorkoutExerciseType])
  async workoutExercises(): Promise<WorkoutExerciseType[]> {
    const entities = await this.service.findAll();
    return entities.map(this.toType);
  }

  @Query(() => WorkoutExerciseType, { nullable: true })
  async workoutExercise(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<WorkoutExerciseType | null> {
    const entity = await this.service.findById(id);
    return entity ? this.toType(entity) : null;
  }

  @Mutation(() => Boolean)
  async deleteWorkoutExercise(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<boolean> {
    await this.service.delete(id);
    return true;
  }

  @ResolveField('exercise', () => ExerciseType, { nullable: true })
  async resolveExercise(@Parent() workoutExercise: WorkoutExercise) {
    return this.exerciseService.findById(workoutExercise.exercise.id);
  }

  @ResolveField('repSchemes', () => [RepSchemeType], { nullable: true })
  async resolveRepSchemes(@Parent() workoutExercise: WorkoutExercise) {
    return this.repSchemeService.findByWorkoutExerciseId(workoutExercise.id);
  }

  @ResolveField('restIntervals', () => [RestIntervalType], { nullable: true })
  async resolveRestIntervals(@Parent() workoutExercise: WorkoutExercise) {
    return this.restIntervalService.findByWorkoutExerciseId(workoutExercise.id);
  }
}
