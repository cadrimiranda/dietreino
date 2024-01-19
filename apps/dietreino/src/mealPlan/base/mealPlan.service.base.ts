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
  MealPlan, // @ts-ignore
  Meal, // @ts-ignore
  User,
} from "@prisma/client";

export class MealPlanServiceBase {
  constructor(protected readonly prisma: PrismaService) {}

  async count<T extends Prisma.MealPlanCountArgs>(
    args: Prisma.SelectSubset<T, Prisma.MealPlanCountArgs>
  ): Promise<number> {
    return this.prisma.mealPlan.count(args);
  }

  async mealPlans<T extends Prisma.MealPlanFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.MealPlanFindManyArgs>
  ): Promise<MealPlan[]> {
    return this.prisma.mealPlan.findMany(args);
  }
  async mealPlan<T extends Prisma.MealPlanFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.MealPlanFindUniqueArgs>
  ): Promise<MealPlan | null> {
    return this.prisma.mealPlan.findUnique(args);
  }
  async createMealPlan<T extends Prisma.MealPlanCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.MealPlanCreateArgs>
  ): Promise<MealPlan> {
    return this.prisma.mealPlan.create<T>(args);
  }
  async updateMealPlan<T extends Prisma.MealPlanUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.MealPlanUpdateArgs>
  ): Promise<MealPlan> {
    return this.prisma.mealPlan.update<T>(args);
  }
  async deleteMealPlan<T extends Prisma.MealPlanDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.MealPlanDeleteArgs>
  ): Promise<MealPlan> {
    return this.prisma.mealPlan.delete(args);
  }

  async findMeal(
    parentId: string,
    args: Prisma.MealFindManyArgs
  ): Promise<Meal[]> {
    return this.prisma.mealPlan
      .findUniqueOrThrow({
        where: { id: parentId },
      })
      .meal(args);
  }

  async findUsers(
    parentId: string,
    args: Prisma.UserFindManyArgs
  ): Promise<User[]> {
    return this.prisma.mealPlan
      .findUniqueOrThrow({
        where: { id: parentId },
      })
      .users(args);
  }
}