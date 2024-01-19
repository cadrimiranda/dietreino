import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { ExercisePlanResolverBase } from "./base/exercisePlan.resolver.base";
import { ExercisePlan } from "./base/ExercisePlan";
import { ExercisePlanService } from "./exercisePlan.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => ExercisePlan)
export class ExercisePlanResolver extends ExercisePlanResolverBase {
  constructor(
    protected readonly service: ExercisePlanService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}
