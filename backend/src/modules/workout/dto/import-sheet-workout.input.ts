// src/modules/workout/dto/import-sheet-workout.input.ts
import { Field, InputType, ID, Int } from '@nestjs/graphql';

@InputType()
class RepSchemeInput {
  @Field(() => Int)
  sets: number;

  @Field(() => Int)
  minReps: number;

  @Field(() => Int)
  maxReps: number;
}

@InputType()
class ExerciseInfoInput {
  @Field()
  name: string;

  @Field()
  rawReps: string;

  @Field(() => [RepSchemeInput])
  repSchemes: RepSchemeInput[];

  @Field(() => [String])
  restIntervals: string[];
}

@InputType()
export class ImportSheetWorkoutInput {
  @Field(() => ID)
  userId: string;

  @Field()
  workoutName: string;

  @Field(() => Int)
  weekStart: number;

  @Field(() => Int)
  weekEnd: number;

  @Field(() => Boolean, { defaultValue: false })
  isActive: boolean;

  @Field()
  sheetName: string;

  @Field(() => [ExerciseInfoInput])
  exercises: ExerciseInfoInput[];
}
