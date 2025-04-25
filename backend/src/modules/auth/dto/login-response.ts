import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from '../../users/dto/user.type';

@ObjectType()
export class LoginResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserType)
  user: UserType;
}
