import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

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
  trainingDays: CreateTrainingDayInput[];
}
