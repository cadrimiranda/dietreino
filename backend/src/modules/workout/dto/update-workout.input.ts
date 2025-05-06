import { InputType, Field, Int, ID } from '@nestjs/graphql';

@InputType()
export class UpdateWorkoutInput {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => Date, { nullable: true })
  weekStart: Date;

  @Field(() => Date, { nullable: true })
  weekEnd?: Date;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;
}
