import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WorkoutHistoryService } from './workout-history.service';
import { WorkoutHistoryType } from './dto/workout-history.type';
import { WorkoutHistorySummaryType } from './dto/workout-history-summary.type';
import { CreateWorkoutHistoryInput } from './dto/create-workout-history.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../utils/roles.enum';

@Resolver(() => WorkoutHistoryType)
export class WorkoutHistoryResolver {
  constructor(private readonly workoutHistoryService: WorkoutHistoryService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [WorkoutHistoryType])
  async workoutHistories(): Promise<Partial<WorkoutHistoryType>[]> {
    const entities = await this.workoutHistoryService.findAll();
    return entities.map((entity) =>
      this.workoutHistoryService.toWorkoutHistoryType(entity),
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => WorkoutHistoryType, { nullable: true })
  async workoutHistory(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Partial<WorkoutHistoryType> | null> {
    const entity = await this.workoutHistoryService.findById(id);
    return entity
      ? this.workoutHistoryService.toWorkoutHistoryType(entity)
      : null;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [WorkoutHistoryType])
  async workoutHistoriesByUser(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<Partial<WorkoutHistoryType>[]> {
    const entities = await this.workoutHistoryService.findByUserId(userId);
    return entities.map((entity) =>
      this.workoutHistoryService.toWorkoutHistoryType(entity),
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [WorkoutHistorySummaryType])
  async workoutHistorySummariesByUser(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<Partial<WorkoutHistorySummaryType>[]> {
    const entities =
      await this.workoutHistoryService.findSummariesByUserId(userId);
    return entities.map((entity) =>
      this.workoutHistoryService.toWorkoutHistorySummaryType(entity),
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [WorkoutHistoryType])
  async workoutHistoriesByWorkout(
    @Args('workoutId', { type: () => ID }) workoutId: string,
  ): Promise<Partial<WorkoutHistoryType>[]> {
    const entities =
      await this.workoutHistoryService.findByWorkoutId(workoutId);
    return entities.map((entity) =>
      this.workoutHistoryService.toWorkoutHistoryType(entity),
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [WorkoutHistoryType])
  async workoutHistoriesByUserAndDate(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('date', { type: () => Date }) date: Date,
  ): Promise<Partial<WorkoutHistoryType>[]> {
    const entities = await this.workoutHistoryService.findByUserIdAndDate(
      userId,
      date,
    );
    return entities.map((entity) =>
      this.workoutHistoryService.toWorkoutHistoryType(entity),
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [WorkoutHistoryType])
  async workoutHistoriesByUserAndDateRange(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('startDate', { type: () => Date }) startDate: Date,
    @Args('endDate', { type: () => Date }) endDate: Date,
  ): Promise<Partial<WorkoutHistoryType>[]> {
    const entities = await this.workoutHistoryService.findByUserIdAndDateRange(
      userId,
      startDate,
      endDate,
    );
    return entities.map((entity) =>
      this.workoutHistoryService.toWorkoutHistoryType(entity),
    );
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.TRAINER)
  @Mutation(() => WorkoutHistoryType)
  async createWorkoutHistory(
    @Args('createWorkoutHistoryInput') input: CreateWorkoutHistoryInput,
  ): Promise<Partial<WorkoutHistoryType>> {
    const entity = await this.workoutHistoryService.create(input);
    return this.workoutHistoryService.toWorkoutHistoryType(entity);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.TRAINER)
  @Mutation(() => Boolean)
  async deleteWorkoutHistory(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.workoutHistoryService.delete(id);
  }
}
