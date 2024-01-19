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
import { ExerciseSet } from "./ExerciseSet";
import { ExerciseSetCountArgs } from "./ExerciseSetCountArgs";
import { ExerciseSetFindManyArgs } from "./ExerciseSetFindManyArgs";
import { ExerciseSetFindUniqueArgs } from "./ExerciseSetFindUniqueArgs";
import { CreateExerciseSetArgs } from "./CreateExerciseSetArgs";
import { UpdateExerciseSetArgs } from "./UpdateExerciseSetArgs";
import { DeleteExerciseSetArgs } from "./DeleteExerciseSetArgs";
import { ExerciseSerieFindManyArgs } from "../../exerciseSerie/base/ExerciseSerieFindManyArgs";
import { ExerciseSerie } from "../../exerciseSerie/base/ExerciseSerie";
import { ExercisePlan } from "../../exercisePlan/base/ExercisePlan";
import { ExerciseSetService } from "../exerciseSet.service";
@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => ExerciseSet)
export class ExerciseSetResolverBase {
  constructor(
    protected readonly service: ExerciseSetService,
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {}

  @graphql.Query(() => MetaQueryPayload)
  @nestAccessControl.UseRoles({
    resource: "ExerciseSet",
    action: "read",
    possession: "any",
  })
  async _exerciseSetsMeta(
    @graphql.Args() args: ExerciseSetCountArgs
  ): Promise<MetaQueryPayload> {
    const result = await this.service.count(args);
    return {
      count: result,
    };
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.Query(() => [ExerciseSet])
  @nestAccessControl.UseRoles({
    resource: "ExerciseSet",
    action: "read",
    possession: "any",
  })
  async exerciseSets(
    @graphql.Args() args: ExerciseSetFindManyArgs
  ): Promise<ExerciseSet[]> {
    return this.service.exerciseSets(args);
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.Query(() => ExerciseSet, { nullable: true })
  @nestAccessControl.UseRoles({
    resource: "ExerciseSet",
    action: "read",
    possession: "own",
  })
  async exerciseSet(
    @graphql.Args() args: ExerciseSetFindUniqueArgs
  ): Promise<ExerciseSet | null> {
    const result = await this.service.exerciseSet(args);
    if (result === null) {
      return null;
    }
    return result;
  }

  @common.UseInterceptors(AclValidateRequestInterceptor)
  @graphql.Mutation(() => ExerciseSet)
  @nestAccessControl.UseRoles({
    resource: "ExerciseSet",
    action: "create",
    possession: "any",
  })
  async createExerciseSet(
    @graphql.Args() args: CreateExerciseSetArgs
  ): Promise<ExerciseSet> {
    return await this.service.createExerciseSet({
      ...args,
      data: {
        ...args.data,

        exercisePlans: args.data.exercisePlans
          ? {
              connect: args.data.exercisePlans,
            }
          : undefined,
      },
    });
  }

  @common.UseInterceptors(AclValidateRequestInterceptor)
  @graphql.Mutation(() => ExerciseSet)
  @nestAccessControl.UseRoles({
    resource: "ExerciseSet",
    action: "update",
    possession: "any",
  })
  async updateExerciseSet(
    @graphql.Args() args: UpdateExerciseSetArgs
  ): Promise<ExerciseSet | null> {
    try {
      return await this.service.updateExerciseSet({
        ...args,
        data: {
          ...args.data,

          exercisePlans: args.data.exercisePlans
            ? {
                connect: args.data.exercisePlans,
              }
            : undefined,
        },
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

  @graphql.Mutation(() => ExerciseSet)
  @nestAccessControl.UseRoles({
    resource: "ExerciseSet",
    action: "delete",
    possession: "any",
  })
  async deleteExerciseSet(
    @graphql.Args() args: DeleteExerciseSetArgs
  ): Promise<ExerciseSet | null> {
    try {
      return await this.service.deleteExerciseSet(args);
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
  @graphql.ResolveField(() => [ExerciseSerie], { name: "exerciseSerie" })
  @nestAccessControl.UseRoles({
    resource: "ExerciseSerie",
    action: "read",
    possession: "any",
  })
  async findExerciseSerie(
    @graphql.Parent() parent: ExerciseSet,
    @graphql.Args() args: ExerciseSerieFindManyArgs
  ): Promise<ExerciseSerie[]> {
    const results = await this.service.findExerciseSerie(parent.id, args);

    if (!results) {
      return [];
    }

    return results;
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => ExercisePlan, {
    nullable: true,
    name: "exercisePlans",
  })
  @nestAccessControl.UseRoles({
    resource: "ExercisePlan",
    action: "read",
    possession: "any",
  })
  async getExercisePlans(
    @graphql.Parent() parent: ExerciseSet
  ): Promise<ExercisePlan | null> {
    const result = await this.service.getExercisePlans(parent.id);

    if (!result) {
      return null;
    }
    return result;
  }
}
