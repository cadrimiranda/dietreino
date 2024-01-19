import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ExerciseSetServiceBase } from "./base/exerciseSet.service.base";

@Injectable()
export class ExerciseSetService extends ExerciseSetServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
