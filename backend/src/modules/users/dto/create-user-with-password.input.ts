// create-user-with-password.input.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserWithPasswordInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  phone: string;
}
