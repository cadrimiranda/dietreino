import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateTrainingDayExerciseInput {
  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  trainingDayId?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  exerciseId?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  order?: number;

}
