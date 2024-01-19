import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MealModuleBase } from "./base/meal.module.base";
import { MealService } from "./meal.service";
import { MealResolver } from "./meal.resolver";

@Module({
  imports: [MealModuleBase, forwardRef(() => AuthModule)],
  providers: [MealService, MealResolver],
  exports: [MealService],
})
export class MealModule {}
