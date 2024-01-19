/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import { ObjectType, Field, Float } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { Decimal } from "decimal.js";
import { MealPlan } from "../../mealPlan/base/MealPlan";
import { Type } from "class-transformer";

@ObjectType()
class Meal {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  @Field(() => String)
  description!: string;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  @Field(() => String)
  id!: string;

  @ApiProperty({
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Field(() => Float, {
    nullable: true,
  })
  kcal!: Decimal | null;

  @ApiProperty({
    required: false,
    type: () => [MealPlan],
  })
  @ValidateNested()
  @Type(() => MealPlan)
  @IsOptional()
  mealPlans?: Array<MealPlan>;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  @Field(() => String)
  name!: string;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  @Field(() => String)
  schedule!: string;
}

export { Meal as Meal };