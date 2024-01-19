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
import { ExercisePlanWhereUniqueInput } from "./ExercisePlanWhereUniqueInput";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";

@ArgsType()
class ExercisePlanFindUniqueArgs {
  @ApiProperty({
    required: true,
    type: () => ExercisePlanWhereUniqueInput,
  })
  @ValidateNested()
  @Type(() => ExercisePlanWhereUniqueInput)
  @Field(() => ExercisePlanWhereUniqueInput, { nullable: false })
  where!: ExercisePlanWhereUniqueInput;
}

export { ExercisePlanFindUniqueArgs as ExercisePlanFindUniqueArgs };
