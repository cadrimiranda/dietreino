import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ExerciseModuleBase } from "./base/exercise.module.base";
import { ExerciseService } from "./exercise.service";
import { ExerciseResolver } from "./exercise.resolver";

@Module({
  imports: [ExerciseModuleBase, forwardRef(() => AuthModule)],
  providers: [ExerciseService, ExerciseResolver],
  exports: [ExerciseService],
})
export class ExerciseModule {}
