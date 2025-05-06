import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class WeeklyLoadType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  trainingDayExerciseId: string;

  @Field(() => Int)
  week: number;

  @Field()
  load: string;
}
