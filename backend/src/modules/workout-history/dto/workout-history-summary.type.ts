import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class WorkoutHistorySummaryType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field()
  executedAt: Date;

  @Field()
  workoutName: string;

  @Field(() => Int)
  trainingDayOrder: number;

  @Field()
  trainingDayName: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => Int, { nullable: true })
  durationMinutes?: number;
}
