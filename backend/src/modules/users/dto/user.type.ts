import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserRole } from '../../../utils/roles.enum';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field({ nullable: true })
  generatedPassword?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => UserType, { nullable: true })
  trainer: UserType;

  @Field(() => UserType, { nullable: true })
  nutritionist: UserType;
}
