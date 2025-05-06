// workout.dto.ts
import { Field, InputType, ID, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  IsDate,
  IsBoolean,
  MaxLength,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TrainingDayUpsertDto } from '@/modules/training-day/dto/trainingDayUpsert';

@InputType()
export class WorkoutUpsertDto {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID(4, { message: 'O ID deve ser um UUID válido' })
  id?: string;

  @Field(() => ID)
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  @IsUUID(4, { message: 'O ID do usuário deve ser um UUID válido' })
  userId: string;

  @Field()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
  @MaxLength(100, { message: 'O nome não pode exceder 100 caracteres' })
  name: string;

  @Field()
  @IsNotEmpty({ message: 'A data de início da semana é obrigatória' })
  @IsDate({ message: 'A data de início da semana deve ser uma data válida' })
  weekStart: Date;

  @Field()
  @IsNotEmpty({ message: 'A data de término da semana é obrigatória' })
  @IsDate({ message: 'A data de término da semana deve ser uma data válida' })
  weekEnd: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate({ message: 'A data de criação deve ser uma data válida' })
  createdAt?: Date;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean({ message: 'O status ativo deve ser um booleano' })
  isActive?: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt({ message: 'O bitfield de dias de treino deve ser um número inteiro' })
  @Min(0, { message: 'O bitfield de dias de treino não pode ser negativo' })
  trainingDaysBitfield?: number;

  @Field(() => [TrainingDayUpsertDto], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingDayUpsertDto)
  trainingDays?: TrainingDayUpsertDto[];
}
