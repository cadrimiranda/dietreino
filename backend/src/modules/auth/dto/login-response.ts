import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from '../../users/dto/user.type';

@ObjectType()
export class LoginResponse {
  @Field()
  token: string;

  @Field(() => UserType)
  user: UserType;
}
