import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ExerciseSerieModuleBase } from "./base/exerciseSerie.module.base";
import { ExerciseSerieService } from "./exerciseSerie.service";
import { ExerciseSerieResolver } from "./exerciseSerie.resolver";

@Module({
  imports: [ExerciseSerieModuleBase, forwardRef(() => AuthModule)],
  providers: [ExerciseSerieService, ExerciseSerieResolver],
  exports: [ExerciseSerieService],
})
export class ExerciseSerieModule {}
