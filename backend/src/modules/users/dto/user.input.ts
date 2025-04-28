import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsEmail,
  IsOptional,
  IsUUID,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../utils/roles.enum';

@InputType()
export class UserInput {
  @Field(() => ID, { nullable: true })
  @IsUUID('4', { message: 'ID de usuário inválido' })
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  password?: string;

  @Field(() => UserRole, { nullable: true })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Papel inválido' })
  role?: UserRole;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'ID de treinador inválido' })
  trainerId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'ID de nutricionista inválido' })
  nutritionistId?: string;
}
