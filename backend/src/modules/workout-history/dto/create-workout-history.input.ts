import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { CreateWorkoutHistoryExerciseInput } from './create-workout-history-exercise.input';

@InputType()
export class CreateWorkoutHistoryInput {
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

  @Field(() => [CreateWorkoutHistoryExerciseInput])
  exercises: CreateWorkoutHistoryExerciseInput[];
}