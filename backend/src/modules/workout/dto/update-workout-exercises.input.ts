import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { Min, Max, IsArray, ValidateNested, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'uniqueDaysOfWeekUpdate', async: false })
export class UniqueDaysOfWeekUpdateConstraint
  implements ValidatorConstraintInterface
{
  validate(trainingDays: UpdateTrainingDayInput[], args: ValidationArguments) {
    if (!Array.isArray(trainingDays)) return true;

    const daysOfWeek = trainingDays.map((day) => day.dayOfWeek);
    const uniqueDays = new Set(daysOfWeek);

    return uniqueDays.size === daysOfWeek.length;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Cada dia da semana pode aparecer apenas uma vez no treino';
  }
}

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
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @Field(() => [UpdateTrainingDayExerciseInput])
  exercises: UpdateTrainingDayExerciseInput[];
}

@InputType()
export class UpdateWorkoutExercisesInput {
  @Field(() => ID)
  workoutId: string;

  @Field(() => [UpdateTrainingDayInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTrainingDayInput)
  @Validate(UniqueDaysOfWeekUpdateConstraint)
  trainingDays: UpdateTrainingDayInput[];
}
