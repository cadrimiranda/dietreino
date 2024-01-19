import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ExercisePlanServiceBase } from "./base/exercisePlan.service.base";

@Injectable()
export class ExercisePlanService extends ExercisePlanServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
