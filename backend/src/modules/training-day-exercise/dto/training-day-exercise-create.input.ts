import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateTrainingDayExerciseInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  trainingDayId: number;

  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  exerciseId: number;

  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  order: number;

  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  sets: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;
}
