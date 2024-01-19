import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ExerciseSetModuleBase } from "./base/exerciseSet.module.base";
import { ExerciseSetService } from "./exerciseSet.service";
import { ExerciseSetResolver } from "./exerciseSet.resolver";

@Module({
  imports: [ExerciseSetModuleBase, forwardRef(() => AuthModule)],
  providers: [ExerciseSetService, ExerciseSetResolver],
  exports: [ExerciseSetService],
})
export class ExerciseSetModule {}
