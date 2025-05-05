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

  @Field(() => Date)
  weekStart: Date;

  @Field(() => Date)
  weekEnd: Date;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => [WorkoutExerciseType], { nullable: true })
  workoutExercises: WorkoutExerciseType[];
}
