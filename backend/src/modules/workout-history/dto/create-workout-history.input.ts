import { InputType, Field, ID, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsDateString,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateWorkoutHistoryExerciseInput } from './create-workout-history-exercise.input';

@InputType()
export class CreateWorkoutHistoryInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  workoutId: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  executedAt: Date;

  @Field()
  @IsNotEmpty()
  @IsString()
  workoutName: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(7)
  trainingDayOrder: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  trainingDayName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(600)
  durationMinutes?: number;

  @Field(() => [CreateWorkoutHistoryExerciseInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutHistoryExerciseInput)
  exercises: CreateWorkoutHistoryExerciseInput[];
}
