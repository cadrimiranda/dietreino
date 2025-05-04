import { InputType, Field, Int } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-minimal';

@InputType()
export class ImportXlsxUserWorkoutInput {
  @Field(() => String)
  userId: string;

  @Field(() => Number)
  workoutId?: number;

  @Field(() => String)
  workoutName: string;

  @Field(() => String)
  weekStart: number;

  @Field(() => String)
  weekEnd: number;

  @Field(() => GraphQLUpload)
  file: FileUpload;
}
