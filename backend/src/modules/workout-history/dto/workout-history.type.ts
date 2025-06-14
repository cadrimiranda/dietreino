import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { WorkoutHistoryExerciseType } from './workout-history-exercise.type';

@ObjectType()
export class WorkoutHistoryType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  workoutId: string;

  @Field()
  executedAt: Date;

  @Field()
  workoutName: string;

  @Field(() => Int)
  trainingDayOrder: number;

  @Field()
  trainingDayName: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => Int, { nullable: true })
  durationMinutes?: number;

  @Field(() => [WorkoutHistoryExerciseType])
  workoutHistoryExercises: WorkoutHistoryExerciseType[];

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}