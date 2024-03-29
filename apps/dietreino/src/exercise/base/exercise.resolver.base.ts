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
import { Exercise } from "./Exercise";
import { ExerciseCountArgs } from "./ExerciseCountArgs";
import { ExerciseFindManyArgs } from "./ExerciseFindManyArgs";
import { ExerciseFindUniqueArgs } from "./ExerciseFindUniqueArgs";
import { CreateExerciseArgs } from "./CreateExerciseArgs";
import { UpdateExerciseArgs } from "./UpdateExerciseArgs";
import { DeleteExerciseArgs } from "./DeleteExerciseArgs";
import { ExerciseSerieFindManyArgs } from "../../exerciseSerie/base/ExerciseSerieFindManyArgs";
import { ExerciseSerie } from "../../exerciseSerie/base/ExerciseSerie";
import { ExerciseService } from "../exercise.service";
@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => Exercise)
export class ExerciseResolverBase {
  constructor(
    protected readonly service: ExerciseService,
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {}

  @graphql.Query(() => MetaQueryPayload)
  @nestAccessControl.UseRoles({
    resource: "Exercise",
    action: "read",
    possession: "any",
  })
  async _exercisesMeta(
    @graphql.Args() args: ExerciseCountArgs
  ): Promise<MetaQueryPayload> {
    const result = await this.service.count(args);
    return {
      count: result,
    };
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.Query(() => [Exercise])
  @nestAccessControl.UseRoles({
    resource: "Exercise",
    action: "read",
    possession: "any",
  })
  async exercises(
    @graphql.Args() args: ExerciseFindManyArgs
  ): Promise<Exercise[]> {
    return this.service.exercises(args);
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.Query(() => Exercise, { nullable: true })
  @nestAccessControl.UseRoles({
    resource: "Exercise",
    action: "read",
    possession: "own",
  })
  async exercise(
    @graphql.Args() args: ExerciseFindUniqueArgs
  ): Promise<Exercise | null> {
    const result = await this.service.exercise(args);
    if (result === null) {
      return null;
    }
    return result;
  }

  @common.UseInterceptors(AclValidateRequestInterceptor)
  @graphql.Mutation(() => Exercise)
  @nestAccessControl.UseRoles({
    resource: "Exercise",
    action: "create",
    possession: "any",
  })
  async createExercise(
    @graphql.Args() args: CreateExerciseArgs
  ): Promise<Exercise> {
    return await this.service.createExercise({
      ...args,
      data: args.data,
    });
  }

  @common.UseInterceptors(AclValidateRequestInterceptor)
  @graphql.Mutation(() => Exercise)
  @nestAccessControl.UseRoles({
    resource: "Exercise",
    action: "update",
    possession: "any",
  })
  async updateExercise(
    @graphql.Args() args: UpdateExerciseArgs
  ): Promise<Exercise | null> {
    try {
      return await this.service.updateExercise({
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

  @graphql.Mutation(() => Exercise)
  @nestAccessControl.UseRoles({
    resource: "Exercise",
    action: "delete",
    possession: "any",
  })
  async deleteExercise(
    @graphql.Args() args: DeleteExerciseArgs
  ): Promise<Exercise | null> {
    try {
      return await this.service.deleteExercise(args);
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
  @graphql.ResolveField(() => [ExerciseSerie], { name: "exerciseSeries" })
  @nestAccessControl.UseRoles({
    resource: "ExerciseSerie",
    action: "read",
    possession: "any",
  })
  async findExerciseSeries(
    @graphql.Parent() parent: Exercise,
    @graphql.Args() args: ExerciseSerieFindManyArgs
  ): Promise<ExerciseSerie[]> {
    const results = await this.service.findExerciseSeries(parent.id, args);

    if (!results) {
      return [];
    }

    return results;
  }
}
