import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { CreateWorkoutHistoryExerciseSetInput } from './create-workout-history-exercise-set.input';

@InputType()
export class CreateWorkoutHistoryExerciseInput {
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

  @Field(() => [CreateWorkoutHistoryExerciseSetInput])
  sets: CreateWorkoutHistoryExerciseSetInput[];
}