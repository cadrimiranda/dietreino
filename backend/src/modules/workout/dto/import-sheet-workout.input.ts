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
class WorkoutExercise {
  @Field()
  sheetName: string;

  @Field(() => [ExerciseInfoInput])
  exercises: ExerciseInfoInput[];
}

@InputType()
export class ImportSheetWorkoutInput {
  @Field(() => ID)
  userId: string;

  @Field(() => Number)
  workoutId?: string;

  @Field()
  workoutName: string;

  @Field(() => String)
  weekStart: string;

  @Field(() => String)
  weekEnd: string;

  @Field(() => Boolean, { defaultValue: false })
  isActive: boolean;

  @Field(() => [WorkoutExercise])
  sheets: WorkoutExercise[];
}
