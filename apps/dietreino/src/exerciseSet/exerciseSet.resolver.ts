import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { ExerciseSetResolverBase } from "./base/exerciseSet.resolver.base";
import { ExerciseSet } from "./base/ExerciseSet";
import { ExerciseSetService } from "./exerciseSet.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => ExerciseSet)
export class ExerciseSetResolver extends ExerciseSetResolverBase {
  constructor(
    protected readonly service: ExerciseSetService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}
