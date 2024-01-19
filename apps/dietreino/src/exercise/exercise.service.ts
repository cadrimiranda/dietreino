import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ExerciseServiceBase } from "./base/exercise.service.base";

@Injectable()
export class ExerciseService extends ExerciseServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
