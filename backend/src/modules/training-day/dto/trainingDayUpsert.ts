// training-day.dto.ts
import { Field, InputType, ID, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  Max,
  MaxLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TrainingDayExerciseUpsertDto } from '@/modules/training-day-exercise/dto/trainingDayUpsert';

@InputType()
export class TrainingDayUpsertDto {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID(4, { message: 'O ID deve ser um UUID válido' })
  id?: string;

  @Field(() => ID)
  @IsNotEmpty({ message: 'O ID do treino é obrigatório' })
  @IsUUID(4, { message: 'O ID do treino deve ser um UUID válido' })
  workoutId: string;

  @Field(() => Int)
  @IsNotEmpty({ message: 'O dia da semana é obrigatório' })
  @IsInt({ message: 'O dia da semana deve ser um número inteiro' })
  @Min(0, { message: 'O dia da semana deve estar entre 0 e 6' })
  @Max(6, { message: 'O dia da semana deve estar entre 0 e 6' })
  dayOfWeek: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'O foco deve ser uma string' })
  focus?: string;

  @Field()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
  @MaxLength(100, { message: 'O nome não pode exceder 100 caracteres' })
  name: string;

  @Field(() => Int)
  @IsNotEmpty({ message: 'A ordem é obrigatória' })
  @IsInt({ message: 'A ordem deve ser um número inteiro' })
  @Min(1, { message: 'A ordem deve ser pelo menos 1' })
  order: number;

  @Field(() => [TrainingDayExerciseUpsertDto], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingDayExerciseUpsertDto)
  trainingDayExercises?: TrainingDayExerciseUpsertDto[];
}
