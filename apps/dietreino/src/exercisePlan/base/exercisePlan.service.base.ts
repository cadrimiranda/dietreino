/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import { PrismaService } from "../../prisma/prisma.service";

import {
  Prisma,
  ExercisePlan, // @ts-ignore
  ExerciseSet, // @ts-ignore
  User,
} from "@prisma/client";

export class ExercisePlanServiceBase {
  constructor(protected readonly prisma: PrismaService) {}

  async count<T extends Prisma.ExercisePlanCountArgs>(
    args: Prisma.SelectSubset<T, Prisma.ExercisePlanCountArgs>
  ): Promise<number> {
    return this.prisma.exercisePlan.count(args);
  }

  async exercisePlans<T extends Prisma.ExercisePlanFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.ExercisePlanFindManyArgs>
  ): Promise<ExercisePlan[]> {
    return this.prisma.exercisePlan.findMany(args);
  }
  async exercisePlan<T extends Prisma.ExercisePlanFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.ExercisePlanFindUniqueArgs>
  ): Promise<ExercisePlan | null> {
    return this.prisma.exercisePlan.findUnique(args);
  }
  async createExercisePlan<T extends Prisma.ExercisePlanCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.ExercisePlanCreateArgs>
  ): Promise<ExercisePlan> {
    return this.prisma.exercisePlan.create<T>(args);
  }
  async updateExercisePlan<T extends Prisma.ExercisePlanUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.ExercisePlanUpdateArgs>
  ): Promise<ExercisePlan> {
    return this.prisma.exercisePlan.update<T>(args);
  }
  async deleteExercisePlan<T extends Prisma.ExercisePlanDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.ExercisePlanDeleteArgs>
  ): Promise<ExercisePlan> {
    return this.prisma.exercisePlan.delete(args);
  }

  async findExerciseSet(
    parentId: string,
    args: Prisma.ExerciseSetFindManyArgs
  ): Promise<ExerciseSet[]> {
    return this.prisma.exercisePlan
      .findUniqueOrThrow({
        where: { id: parentId },
      })
      .exerciseSet(args);
  }

  async getUser(parentId: string): Promise<User | null> {
    return this.prisma.exercisePlan
      .findUnique({
        where: { id: parentId },
      })
      .user();
  }
}
