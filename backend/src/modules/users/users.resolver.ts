import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserType } from './dto/user.type';
import { UserInput } from './dto/user.input';
import { UseGuards } from '@nestjs/common';
import { UserRole } from '../../utils/roles.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities';
import { WorkoutType } from '../workout/workout.type';
import { WorkoutService } from '../workout/workout.service';
import { CreateWorkoutInput } from '../workout/dto/create-workout.input';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly workoutService: WorkoutService,
  ) {}

  @Query(() => [UserType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  async users(): Promise<UserType[]> {
    return this.usersService.findAll();
  }

  @Query(() => UserType)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  async user(@Args('id', { type: () => ID }) id: string): Promise<UserType> {
    return this.usersService.findById(id);
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard)
  async upsertUser(
    @Args('userInput') userInput: UserInput,
    @CurrentUser() currentUser: User,
  ): Promise<UserType> {
    const result = await this.usersService.upsertUser(userInput, currentUser);
    // Se houver uma senha gerada, adicione-a ao objeto de resposta
    if ('generatedPassword' in result) {
      return {
        ...result,
        generatedPassword: result.generatedPassword,
      };
    }
    return result;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  async deleteUser(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.usersService.delete(id);
    return true;
  }

  @Query(() => [UserType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  async trainerClients(
    @Args('trainerId', { type: () => ID }) trainerId: string,
  ): Promise<UserType[]> {
    return this.usersService.getClientsForTrainer(trainerId);
  }

  @Query(() => [UserType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  async nutritionistClients(
    @Args('nutritionistId', { type: () => ID }) nutritionistId: string,
  ): Promise<UserType[]> {
    return this.usersService.getClientsForNutritionist(nutritionistId);
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  async assignTrainer(
    @Args('clientId', { type: () => ID }) clientId: string,
    @Args('trainerId', { type: () => ID }) trainerId: string,
  ): Promise<UserType | null> {
    return this.usersService.assignClientToTrainer(clientId, trainerId);
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  async assignNutritionist(
    @Args('clientId', { type: () => ID }) clientId: string,
    @Args('nutritionistId', { type: () => ID }) nutritionistId: string,
  ): Promise<UserType | null> {
    return this.usersService.assignClientToNutritionist(
      clientId,
      nutritionistId,
    );
  }

  @Query(() => UserType)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  async clientForProfessional(
    @Args('clientId', { type: () => ID }) clientId: string,
    @Args('professionalId', { type: () => ID }) professionalId: string,
  ): Promise<UserType> {
    return this.usersService.getClientForProfessional(clientId, professionalId);
  }

  @Mutation(() => WorkoutType)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.NUTRITIONIST)
  async addWorkoutToUser(
    @Args('clientId', { type: () => ID }) clientId: string,
    @Args('workoutInput') input: CreateWorkoutInput,
    @CurrentUser() currentUser: User,
  ): Promise<WorkoutType> {
    await this.usersService.getClientForProfessional(clientId, currentUser.id);

    const workout = await this.workoutService.create({
      user_id: clientId,
      name: input.name,
      week_start: input.weekStart,
      week_end: input.weekEnd,
      is_active: input.isActive ?? false,
    });

    return this.workoutService.toWorkoutType(workout);
  }

  @ResolveField('trainer', () => UserType, { nullable: true })
  async resolveTrainer(@Parent() user: User) {
    if (user.trainerId) {
      return this.usersService.findById(user.trainerId);
    }
    return null;
  }

  @ResolveField('nutritionist', () => UserType, { nullable: true })
  async resolveNutritionist(@Parent() user: User) {
    if (user.nutritionistId) {
      return this.usersService.findById(user.nutritionistId);
    }
    return null;
  }

  @ResolveField('clients_as_trainer', () => [UserType], { nullable: true })
  async resolveClientsAsTrainer(@Parent() user: User) {
    if (user.role === UserRole.TRAINER) {
      return this.usersService.getClientsForTrainer(user.id);
    }
    return [];
  }

  @ResolveField('clients_as_nutritionist', () => [UserType], { nullable: true })
  async resolveClientsAsNutritionist(@Parent() user: User) {
    if (user.role === UserRole.NUTRITIONIST) {
      return this.usersService.getClientsForNutritionist(user.id);
    }
    return [];
  }

  @ResolveField('workouts', () => [WorkoutType], { nullable: true })
  async resolveWorkouts(@Parent() user: User) {
    if (!user.id) {
      return [];
    }
    return this.workoutService.findByUserId(user.id);
  }
}
