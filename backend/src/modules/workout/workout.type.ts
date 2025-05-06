import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class WorkoutType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  name: string;

  @Field(() => Date)
  weekStart: Date;

  @Field(() => Date)
  weekEnd: Date;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;
}
