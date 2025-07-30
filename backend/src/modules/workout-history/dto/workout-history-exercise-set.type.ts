import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class WorkoutHistoryExerciseSetType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  workoutHistoryExerciseId: string;

  @Field(() => Int)
  setNumber: number;

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field(() => Int)
  reps: number;

  @Field(() => Float, { nullable: true })
  weightLeft?: number;

  @Field(() => Int, { nullable: true })
  repsLeft?: number;

  @Field(() => Float, { nullable: true })
  weightRight?: number;

  @Field(() => Int, { nullable: true })
  repsRight?: number;

  @Field(() => Boolean, { defaultValue: false })
  isBilateral?: boolean;

  @Field(() => Int, { nullable: true })
  plannedRepsMin?: number;

  @Field(() => Int, { nullable: true })
  plannedRepsMax?: number;

  @Field(() => Int, { nullable: true })
  restSeconds?: number;

  @Field()
  isCompleted: boolean;

  @Field()
  isFailure: boolean;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  executedAt: Date;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
