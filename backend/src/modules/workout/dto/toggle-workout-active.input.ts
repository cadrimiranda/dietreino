import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class ToggleWorkoutActiveInput {
  @Field(() => ID)
  id: string;

  @Field(() => Boolean)
  active: boolean;
}
