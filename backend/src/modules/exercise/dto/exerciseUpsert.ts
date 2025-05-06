// exercise.dto.ts
import { Field, InputType, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
} from 'class-validator';

@InputType()
export class ExerciseUpsertDto {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  id?: string;

  @Field()
  @IsNotEmpty({ message: 'O nome do exercício é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
  @MaxLength(100, { message: 'O nome não pode exceder 100 caracteres' })
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'O link do vídeo deve ser uma URL válida' })
  videoLink?: string;
}
