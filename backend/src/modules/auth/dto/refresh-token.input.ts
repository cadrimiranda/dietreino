import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class RefreshTokenInput {
  @Field()
  @IsNotEmpty({ message: 'Refresh token é obrigatório' })
  refreshToken: string;
}
