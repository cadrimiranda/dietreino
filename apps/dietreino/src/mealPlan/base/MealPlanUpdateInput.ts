/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import { InputType, Field, Float } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsDate,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";
import { Decimal } from "decimal.js";
import { MealUpdateManyWithoutMealPlansInput } from "./MealUpdateManyWithoutMealPlansInput";
import { UserUpdateManyWithoutMealPlansInput } from "./UserUpdateManyWithoutMealPlansInput";

@InputType()
class MealPlanUpdateInput {
  @ApiProperty({
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @Field(() => Date, {
    nullable: true,
  })
  ExpiresAt?: Date | null;

  @ApiProperty({
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Field(() => Float, {
    nullable: true,
  })
  kcal?: Decimal | null;

  @ApiProperty({
    required: false,
    type: () => MealUpdateManyWithoutMealPlansInput,
  })
  @ValidateNested()
  @Type(() => MealUpdateManyWithoutMealPlansInput)
  @IsOptional()
  @Field(() => MealUpdateManyWithoutMealPlansInput, {
    nullable: true,
  })
  meal?: MealUpdateManyWithoutMealPlansInput;

  @ApiProperty({
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, {
    nullable: true,
  })
  name?: string | null;

  @ApiProperty({
    required: false,
    type: () => UserUpdateManyWithoutMealPlansInput,
  })
  @ValidateNested()
  @Type(() => UserUpdateManyWithoutMealPlansInput)
  @IsOptional()
  @Field(() => UserUpdateManyWithoutMealPlansInput, {
    nullable: true,
  })
  users?: UserUpdateManyWithoutMealPlansInput;
}

export { MealPlanUpdateInput as MealPlanUpdateInput };