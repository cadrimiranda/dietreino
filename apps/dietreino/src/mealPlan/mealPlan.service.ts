import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MealPlanServiceBase } from "./base/mealPlan.service.base";

@Injectable()
export class MealPlanService extends MealPlanServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
