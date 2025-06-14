import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { WorkoutHistoryExerciseSetType } from './workout-history-exercise-set.type';

@ObjectType()
export class WorkoutHistoryExerciseType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  workoutHistoryId: string;

  @Field(() => ID)
  exerciseId: string;

  @Field(() => Int)
  order: number;

  @Field()
  exerciseName: string;

  @Field(() => Int)
  plannedSets: number;

  @Field(() => Int)
  completedSets: number;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [WorkoutHistoryExerciseSetType])
  workoutHistoryExerciseSets: WorkoutHistoryExerciseSetType[];

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}