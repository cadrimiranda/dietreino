import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ExerciseSerieServiceBase } from "./base/exerciseSerie.service.base";

@Injectable()
export class ExerciseSerieService extends ExerciseSerieServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
