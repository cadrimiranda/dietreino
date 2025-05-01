import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { ExerciseType } from '../../exercise/dto/exercise.type';
import { RepSchemeType } from '../../rep-scheme/dto/rep-scheme.type';
import { RestIntervalType } from '../../rest-interval/dto/rest-interval.type';

@ObjectType()
export class WorkoutExerciseType {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  workoutId: number;

  @Field(() => Int)
  exerciseId: number;

  @Field(() => Int)
  order: number;

  @Field(() => Int)
  sets: number;

  @Field()
  repetitions: string;

  @Field()
  rest: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => ExerciseType, { nullable: true })
  exercise: ExerciseType;

  @Field(() => [RepSchemeType], { nullable: true })
  repSchemes: RepSchemeType[];

  @Field(() => [RestIntervalType], { nullable: true })
  restIntervals: RestIntervalType[];
}
