/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import { InputType, Field } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { ExerciseSerieWhereInput } from "./ExerciseSerieWhereInput";
import { ValidateNested, IsOptional } from "class-validator";
import { Type } from "class-transformer";

@InputType()
class ExerciseSerieListRelationFilter {
  @ApiProperty({
    required: false,
    type: () => ExerciseSerieWhereInput,
  })
  @ValidateNested()
  @Type(() => ExerciseSerieWhereInput)
  @IsOptional()
  @Field(() => ExerciseSerieWhereInput, {
    nullable: true,
  })
  every?: ExerciseSerieWhereInput;

  @ApiProperty({
    required: false,
    type: () => ExerciseSerieWhereInput,
  })
  @ValidateNested()
  @Type(() => ExerciseSerieWhereInput)
  @IsOptional()
  @Field(() => ExerciseSerieWhereInput, {
    nullable: true,
  })
  some?: ExerciseSerieWhereInput;

  @ApiProperty({
    required: false,
    type: () => ExerciseSerieWhereInput,
  })
  @ValidateNested()
  @Type(() => ExerciseSerieWhereInput)
  @IsOptional()
  @Field(() => ExerciseSerieWhereInput, {
    nullable: true,
  })
  none?: ExerciseSerieWhereInput;
}
export { ExerciseSerieListRelationFilter as ExerciseSerieListRelationFilter };