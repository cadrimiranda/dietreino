// training-day-exercise.dto.ts
import { Field, InputType, ID, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RepSchemeUpsertDto } from '@/modules/rep-scheme/dto/repSchemeUpsert';
import { RestIntervalUpsertDto } from '@/modules/rest-interval/dto/restIntervalUpsert';

@InputType()
export class TrainingDayExerciseUpsertDto {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID(4, { message: 'O ID deve ser um UUID válido' })
  id?: string;

  @Field(() => ID)
  @IsNotEmpty({ message: 'O ID do dia de treino é obrigatório' })
  @IsUUID(4, { message: 'O ID do dia de treino deve ser um UUID válido' })
  trainingDayId: string;

  @Field(() => ID)
  @IsNotEmpty({ message: 'O ID do exercício é obrigatório' })
  @IsUUID(4, { message: 'O ID do exercício deve ser um UUID válido' })
  exerciseId: string;

  @Field(() => Int)
  @IsNotEmpty({ message: 'A ordem é obrigatória' })
  @IsInt({ message: 'A ordem deve ser um número inteiro' })
  @Min(1, { message: 'A ordem deve ser pelo menos 1' })
  order: number;

  @Field(() => Int)
  @IsNotEmpty({ message: 'O número de séries é obrigatório' })
  @IsInt({ message: 'O número de séries deve ser um número inteiro' })
  @Min(1, { message: 'O número de séries deve ser pelo menos 1' })
  sets: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'As notas devem ser uma string' })
  notes?: string;

  @Field(() => [RepSchemeUpsertDto], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepSchemeUpsertDto)
  repSchemes?: RepSchemeUpsertDto[];

  @Field(() => [RestIntervalUpsertDto], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RestIntervalUpsertDto)
  restIntervals?: RestIntervalUpsertDto[];
}
