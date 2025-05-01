import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class RepSchemeType {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  sets: number;

  @Field(() => Int)
  min_reps: number;

  @Field(() => Int)
  max_reps: number;
}
