import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { WorkoutExerciseType } from '../workout-exercise/dto/workout-exercise.type';

@ObjectType()
export class WorkoutType {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  weekStart: number;

  @Field(() => Int)
  weekEnd: number;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => [WorkoutExerciseType], { nullable: true })
  workoutExercises: WorkoutExerciseType[];
}
