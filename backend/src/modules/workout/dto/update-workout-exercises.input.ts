import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class UpdateRepSchemeInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => Int)
  sets: number;

  @Field(() => Int)
  minReps: number;

  @Field(() => Int)
  maxReps: number;
}

@InputType()
export class UpdateRestIntervalInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String)
  intervalTime: string;

  @Field(() => Int)
  order: number;
}

@InputType()
export class UpdateTrainingDayExerciseInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => ID)
  exerciseId: string;

  @Field(() => Int)
  order: number;

  @Field(() => [UpdateRepSchemeInput])
  repSchemes: UpdateRepSchemeInput[];

  @Field(() => [UpdateRestIntervalInput])
  restIntervals: UpdateRestIntervalInput[];
}

@InputType()
export class UpdateTrainingDayInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  order: number;

  @Field(() => Int)
  dayOfWeek: number;

  @Field(() => [UpdateTrainingDayExerciseInput])
  exercises: UpdateTrainingDayExerciseInput[];
}

@InputType()
export class UpdateWorkoutExercisesInput {
  @Field(() => ID)
  workoutId: string;

  @Field(() => [UpdateTrainingDayInput])
  trainingDays: UpdateTrainingDayInput[];
}