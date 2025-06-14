import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min, Max, ArrayMinSize, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { CreateWorkoutHistoryExerciseSetInput } from './create-workout-history-exercise-set.input';

@ValidatorConstraint({ name: 'completedSetsValidation', async: false })
export class CompletedSetsValidationConstraint implements ValidatorConstraintInterface {
  validate(completedSets: number, args: ValidationArguments) {
    const obj = args.object as CreateWorkoutHistoryExerciseInput;
    return completedSets <= obj.plannedSets;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Séries completadas não pode ser maior que séries planejadas';
  }
}

@InputType()
export class CreateWorkoutHistoryExerciseInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  exerciseId: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  order: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  exerciseName: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(20)
  plannedSets: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(20)
  @Validate(CompletedSetsValidationConstraint)
  completedSets: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [CreateWorkoutHistoryExerciseSetInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutHistoryExerciseSetInput)
  sets: CreateWorkoutHistoryExerciseSetInput[];
}