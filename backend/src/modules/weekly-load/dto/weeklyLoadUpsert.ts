// weekly-load.dto.ts
import { Field, InputType, ID, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';

@InputType()
export class WeeklyLoadUpsertDto {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID(4, { message: 'O ID deve ser um UUID válido' })
  id?: string;

  @Field(() => ID)
  @IsNotEmpty({ message: 'O ID do exercício do dia de treino é obrigatório' })
  @IsUUID(4, {
    message: 'O ID do exercício do dia de treino deve ser um UUID válido',
  })
  trainingDayExerciseId: string;

  @Field(() => Int)
  @IsNotEmpty({ message: 'A semana é obrigatória' })
  @IsInt({ message: 'A semana deve ser um número inteiro' })
  @Min(1, { message: 'A semana deve ser pelo menos 1' })
  week: number;

  @Field()
  @IsNotEmpty({ message: 'A carga é obrigatória' })
  @IsString({ message: 'A carga deve ser uma string' })
  @MaxLength(100, { message: 'A carga não pode exceder 100 caracteres' })
  load: string;
}
