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
  Meal, // @ts-ignore
  MealPlan,
} from "@prisma/client";

export class MealServiceBase {
  constructor(protected readonly prisma: PrismaService) {}

  async count<T extends Prisma.MealCountArgs>(
    args: Prisma.SelectSubset<T, Prisma.MealCountArgs>
  ): Promise<number> {
    return this.prisma.meal.count(args);
  }

  async meals<T extends Prisma.MealFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.MealFindManyArgs>
  ): Promise<Meal[]> {
    return this.prisma.meal.findMany(args);
  }
  async meal<T extends Prisma.MealFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.MealFindUniqueArgs>
  ): Promise<Meal | null> {
    return this.prisma.meal.findUnique(args);
  }
  async createMeal<T extends Prisma.MealCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.MealCreateArgs>
  ): Promise<Meal> {
    return this.prisma.meal.create<T>(args);
  }
  async updateMeal<T extends Prisma.MealUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.MealUpdateArgs>
  ): Promise<Meal> {
    return this.prisma.meal.update<T>(args);
  }
  async deleteMeal<T extends Prisma.MealDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.MealDeleteArgs>
  ): Promise<Meal> {
    return this.prisma.meal.delete(args);
  }

  async findMealPlans(
    parentId: string,
    args: Prisma.MealPlanFindManyArgs
  ): Promise<MealPlan[]> {
    return this.prisma.meal
      .findUniqueOrThrow({
        where: { id: parentId },
      })
      .mealPlans(args);
  }
}
