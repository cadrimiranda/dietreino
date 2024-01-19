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
import { StringFilter } from "../../util/StringFilter";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";
import { ExercisePlanWhereUniqueInput } from "../../exercisePlan/base/ExercisePlanWhereUniqueInput";
import { StringNullableFilter } from "../../util/StringNullableFilter";
import { MealPlanWhereUniqueInput } from "../../mealPlan/base/MealPlanWhereUniqueInput";

@InputType()
class UserWhereInput {
  @ApiProperty({
    required: false,
    type: StringFilter,
  })
  @Type(() => StringFilter)
  @IsOptional()
  @Field(() => StringFilter, {
    nullable: true,
  })
  email?: StringFilter;

  @ApiProperty({
    required: false,
    type: () => ExercisePlanWhereUniqueInput,
  })
  @ValidateNested()
  @Type(() => ExercisePlanWhereUniqueInput)
  @IsOptional()
  @Field(() => ExercisePlanWhereUniqueInput, {
    nullable: true,
  })
  exercisePlans?: ExercisePlanWhereUniqueInput;

  @ApiProperty({
    required: false,
    type: StringFilter,
  })
  @Type(() => StringFilter)
  @IsOptional()
  @Field(() => StringFilter, {
    nullable: true,
  })
  firstName?: StringFilter;

  @ApiProperty({
    required: false,
    type: StringFilter,
  })
  @Type(() => StringFilter)
  @IsOptional()
  @Field(() => StringFilter, {
    nullable: true,
  })
  id?: StringFilter;

  @ApiProperty({
    required: false,
    type: StringNullableFilter,
  })
  @Type(() => StringNullableFilter)
  @IsOptional()
  @Field(() => StringNullableFilter, {
    nullable: true,
  })
  lastName?: StringNullableFilter;

  @ApiProperty({
    required: false,
    type: () => MealPlanWhereUniqueInput,
  })
  @ValidateNested()
  @Type(() => MealPlanWhereUniqueInput)
  @IsOptional()
  @Field(() => MealPlanWhereUniqueInput, {
    nullable: true,
  })
  mealPlan?: MealPlanWhereUniqueInput;

  @ApiProperty({
    required: false,
    type: StringFilter,
  })
  @Type(() => StringFilter)
  @IsOptional()
  @Field(() => StringFilter, {
    nullable: true,
  })
  username?: StringFilter;
}

export { UserWhereInput as UserWhereInput };
