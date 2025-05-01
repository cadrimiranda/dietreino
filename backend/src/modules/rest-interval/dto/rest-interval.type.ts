import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class RestIntervalType {
  @Field(() => ID)
  id: number;

  @Field()
  interval_time: string;

  @Field(() => Int)
  order: number;
}
