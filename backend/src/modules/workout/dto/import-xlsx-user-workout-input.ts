import { InputType, Field, Int } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-minimal';

@InputType()
export class ImportXlsxUserWorkoutInput {
  @Field(() => String)
  userId: string;

  @Field(() => Number, { nullable: true })
  workoutId?: string;

  @Field(() => String)
  workoutName: string;

  @Field(() => String)
  weekStart: string;

  @Field(() => String)
  weekEnd: string;

  @Field(() => GraphQLUpload)
  file: Promise<FileUpload>;
}
