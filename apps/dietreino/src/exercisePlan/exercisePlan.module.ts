import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ExercisePlanModuleBase } from "./base/exercisePlan.module.base";
import { ExercisePlanService } from "./exercisePlan.service";
import { ExercisePlanResolver } from "./exercisePlan.resolver";

@Module({
  imports: [ExercisePlanModuleBase, forwardRef(() => AuthModule)],
  providers: [ExercisePlanService, ExercisePlanResolver],
  exports: [ExercisePlanService],
})
export class ExercisePlanModule {}
