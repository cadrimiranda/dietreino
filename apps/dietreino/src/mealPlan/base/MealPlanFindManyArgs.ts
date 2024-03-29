/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import { ArgsType, Field } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { MealPlanWhereInput } from "./MealPlanWhereInput";
import { IsOptional, ValidateNested, IsInt } from "class-validator";
import { Type } from "class-transformer";
import { MealPlanOrderByInput } from "./MealPlanOrderByInput";

@ArgsType()
class MealPlanFindManyArgs {
  @ApiProperty({
    required: false,
    type: () => MealPlanWhereInput,
  })
  @IsOptional()
  @ValidateNested()
  @Field(() => MealPlanWhereInput, { nullable: true })
  @Type(() => MealPlanWhereInput)
  where?: MealPlanWhereInput;

  @ApiProperty({
    required: false,
    type: [MealPlanOrderByInput],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Field(() => [MealPlanOrderByInput], { nullable: true })
  @Type(() => MealPlanOrderByInput)
  orderBy?: Array<MealPlanOrderByInput>;

  @ApiProperty({
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Field(() => Number, { nullable: true })
  @Type(() => Number)
  skip?: number;

  @ApiProperty({
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Field(() => Number, { nullable: true })
  @Type(() => Number)
  take?: number;
}

export { MealPlanFindManyArgs as MealPlanFindManyArgs };
