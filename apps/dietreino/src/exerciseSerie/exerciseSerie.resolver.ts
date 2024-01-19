import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { ExerciseSerieResolverBase } from "./base/exerciseSerie.resolver.base";
import { ExerciseSerie } from "./base/ExerciseSerie";
import { ExerciseSerieService } from "./exerciseSerie.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => ExerciseSerie)
export class ExerciseSerieResolver extends ExerciseSerieResolverBase {
  constructor(
    protected readonly service: ExerciseSerieService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}
