// user.type.ts (modified)
import { ObjectType, Field, ID } from '@nestjs/graphql';

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
}
