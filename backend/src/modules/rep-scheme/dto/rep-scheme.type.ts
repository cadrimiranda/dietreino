import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class RepSchemeType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  sets: number;

  @Field(() => Int)
  minReps: number;

  @Field(() => Int)
  maxReps: number;
}
