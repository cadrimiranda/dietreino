import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateWorkoutInput {
  @Field(() => String)
  userId: string;

  @Field(() => String)
  name: string;

  @Field(() => Date)
  weekStart: Date;

  @Field(() => Date)
  weekEnd: Date;

  @Field(() => Boolean, { defaultValue: false })
  isActive?: boolean;
}
