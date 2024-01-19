/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import * as graphql from "@nestjs/graphql";
import { GraphQLError } from "graphql";
import { isRecordNotFoundError } from "../../prisma.util";
import { MetaQueryPayload } from "../../util/MetaQueryPayload";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { AclFilterResponseInterceptor } from "../../interceptors/aclFilterResponse.interceptor";
import { AclValidateRequestInterceptor } from "../../interceptors/aclValidateRequest.interceptor";
import { MealPlan } from "./MealPlan";
import { MealPlanCountArgs } from "./MealPlanCountArgs";
import { MealPlanFindManyArgs } from "./MealPlanFindManyArgs";
import { MealPlanFindUniqueArgs } from "./MealPlanFindUniqueArgs";
import { CreateMealPlanArgs } from "./CreateMealPlanArgs";
import { UpdateMealPlanArgs } from "./UpdateMealPlanArgs";
import { DeleteMealPlanArgs } from "./DeleteMealPlanArgs";
import { MealFindManyArgs } from "../../meal/base/MealFindManyArgs";
import { Meal } from "../../meal/base/Meal";
import { UserFindManyArgs } from "../../user/base/UserFindManyArgs";
import { User } from "../../user/base/User";
import { MealPlanService } from "../mealPlan.service";
@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => MealPlan)
export class MealPlanResolverBase {
  constructor(
    protected readonly service: MealPlanService,
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {}

  @graphql.Query(() => MetaQueryPayload)
  @nestAccessControl.UseRoles({
    resource: "MealPlan",
    action: "read",
    possession: "any",
  })
  async _mealPlansMeta(
    @graphql.Args() args: MealPlanCountArgs
  ): Promise<MetaQueryPayload> {
    const result = await this.service.count(args);
    return {
      count: result,
    };
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.Query(() => [MealPlan])
  @nestAccessControl.UseRoles({
    resource: "MealPlan",
    action: "read",
    possession: "any",
  })
  async mealPlans(
    @graphql.Args() args: MealPlanFindManyArgs
  ): Promise<MealPlan[]> {
    return this.service.mealPlans(args);
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.Query(() => MealPlan, { nullable: true })
  @nestAccessControl.UseRoles({
    resource: "MealPlan",
    action: "read",
    possession: "own",
  })
  async mealPlan(
    @graphql.Args() args: MealPlanFindUniqueArgs
  ): Promise<MealPlan | null> {
    const result = await this.service.mealPlan(args);
    if (result === null) {
      return null;
    }
    return result;
  }

  @common.UseInterceptors(AclValidateRequestInterceptor)
  @graphql.Mutation(() => MealPlan)
  @nestAccessControl.UseRoles({
    resource: "MealPlan",
    action: "create",
    possession: "any",
  })
  async createMealPlan(
    @graphql.Args() args: CreateMealPlanArgs
  ): Promise<MealPlan> {
    return await this.service.createMealPlan({
      ...args,
      data: args.data,
    });
  }

  @common.UseInterceptors(AclValidateRequestInterceptor)
  @graphql.Mutation(() => MealPlan)
  @nestAccessControl.UseRoles({
    resource: "MealPlan",
    action: "update",
    possession: "any",
  })
  async updateMealPlan(
    @graphql.Args() args: UpdateMealPlanArgs
  ): Promise<MealPlan | null> {
    try {
      return await this.service.updateMealPlan({
        ...args,
        data: args.data,
      });
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new GraphQLError(
          `No resource was found for ${JSON.stringify(args.where)}`
        );
      }
      throw error;
    }
  }

  @graphql.Mutation(() => MealPlan)
  @nestAccessControl.UseRoles({
    resource: "MealPlan",
    action: "delete",
    possession: "any",
  })
  async deleteMealPlan(
    @graphql.Args() args: DeleteMealPlanArgs
  ): Promise<MealPlan | null> {
    try {
      return await this.service.deleteMealPlan(args);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new GraphQLError(
          `No resource was found for ${JSON.stringify(args.where)}`
        );
      }
      throw error;
    }
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => [Meal], { name: "meal" })
  @nestAccessControl.UseRoles({
    resource: "Meal",
    action: "read",
    possession: "any",
  })
  async findMeal(
    @graphql.Parent() parent: MealPlan,
    @graphql.Args() args: MealFindManyArgs
  ): Promise<Meal[]> {
    const results = await this.service.findMeal(parent.id, args);

    if (!results) {
      return [];
    }

    return results;
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => [User], { name: "users" })
  @nestAccessControl.UseRoles({
    resource: "User",
    action: "read",
    possession: "any",
  })
  async findUsers(
    @graphql.Parent() parent: MealPlan,
    @graphql.Args() args: UserFindManyArgs
  ): Promise<User[]> {
    const results = await this.service.findUsers(parent.id, args);

    if (!results) {
      return [];
    }

    return results;
  }
}
