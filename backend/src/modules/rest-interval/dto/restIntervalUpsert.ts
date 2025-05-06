// rest-interval.dto.ts
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
export class RestIntervalUpsertDto {
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

  @Field()
  @IsNotEmpty({ message: 'O tempo de intervalo é obrigatório' })
  @IsString({ message: 'O tempo de intervalo deve ser uma string' })
  @MaxLength(30, {
    message: 'O tempo de intervalo não pode exceder 30 caracteres',
  })
  intervalTime: string;

  @Field(() => Int)
  @IsNotEmpty({ message: 'A ordem é obrigatória' })
  @IsInt({ message: 'A ordem deve ser um número inteiro' })
  @Min(1, { message: 'A ordem deve ser pelo menos 1' })
  order: number;
}
