import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'uniqueDaysOfWeek', async: false })
export class UniqueDaysOfWeekConstraint
  implements ValidatorConstraintInterface
{
  validate(trainingDays: CreateTrainingDayInput[], args: ValidationArguments) {
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
export class CreateRepSchemeInput {
  @Field()
  @IsNotEmpty()
  @IsNumber()
  sets: number;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  minReps: number;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  maxReps: number;
}

@InputType()
export class CreateRestIntervalInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  intervalTime: string;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  order: number;
}

@InputType()
export class CreateTrainingDayExerciseInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  exerciseId: string;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  order: number;

  @Field(() => [CreateRepSchemeInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRepSchemeInput)
  repSchemes: CreateRepSchemeInput[];

  @Field(() => [CreateRestIntervalInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRestIntervalInput)
  restIntervals: CreateRestIntervalInput[];
}

@InputType()
export class CreateTrainingDayInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  order: number;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @Field(() => [CreateTrainingDayExerciseInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTrainingDayExerciseInput)
  exercises: CreateTrainingDayExerciseInput[];
}

@InputType()
export class CreateWorkoutInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  weekStart: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  weekEnd: string;

  @Field(() => [CreateTrainingDayInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTrainingDayInput)
  @Validate(UniqueDaysOfWeekConstraint)
  trainingDays: CreateTrainingDayInput[];
}
