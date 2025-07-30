import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsDateString,
  Validate,
} from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'plannedRepsValidation', async: false })
export class PlannedRepsValidationConstraint
  implements ValidatorConstraintInterface
{
  validate(plannedRepsMax: number, args: ValidationArguments) {
    const obj = args.object as CreateWorkoutHistoryExerciseSetInput;
    if (!obj.plannedRepsMin || !plannedRepsMax) return true;
    return plannedRepsMax >= obj.plannedRepsMin;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Repetições máximas planejadas deve ser maior ou igual às repetições mínimas';
  }
}

@InputType()
export class CreateWorkoutHistoryExerciseSetInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(20)
  setNumber: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  weight?: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(200)
  reps: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  weightLeft?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  repsLeft?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  weightRight?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  repsRight?: number;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isBilateral?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  plannedRepsMin?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  @Validate(PlannedRepsValidationConstraint)
  plannedRepsMax?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1800)
  restSeconds?: number;

  @Field()
  @IsNotEmpty()
  @IsBoolean()
  isCompleted: boolean;

  @Field()
  @IsNotEmpty()
  @IsBoolean()
  isFailure: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  executedAt: Date;
}
