import { Field, InputType, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

@InputType()
export class RepSchemeUpsertDto {
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
  @IsNotEmpty({ message: 'O número de séries é obrigatório' })
  @IsInt({ message: 'O número de séries deve ser um número inteiro' })
  @Min(1, { message: 'O número de séries deve ser pelo menos 1' })
  sets: number;

  @Field(() => Int)
  @IsNotEmpty({ message: 'O número mínimo de repetições é obrigatório' })
  @IsInt({
    message: 'O número mínimo de repetições deve ser um número inteiro',
  })
  @Min(0, { message: 'O número mínimo de repetições não pode ser negativo' })
  minReps: number;

  @Field(() => Int)
  @IsNotEmpty({ message: 'O número máximo de repetições é obrigatório' })
  @IsInt({
    message: 'O número máximo de repetições deve ser um número inteiro',
  })
  @Min(0, { message: 'O número máximo de repetições não pode ser negativo' })
  maxReps: number;
}
