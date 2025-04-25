import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserType } from './dto/user.type';
import { UserInput } from './dto/user.input';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserType])
  async users(): Promise<UserType[]> {
    return this.usersService.findAll();
  }

  @Query(() => UserType)
  async user(@Args('id', { type: () => ID }) id: string): Promise<UserType> {
    return this.usersService.findById(id);
  }

  @Mutation(() => UserType)
  async upsertUser(@Args('userInput') userInput: UserInput): Promise<UserType> {
    return this.usersService.upsertUser(userInput);
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.usersService.delete(id);
    return true;
  }

  @Query(() => [UserType])
  async trainerClients(
    @Args('trainerId', { type: () => ID }) trainerId: string,
  ): Promise<UserType[]> {
    return this.usersService.getClientsForTrainer(trainerId);
  }

  @Query(() => [UserType])
  async nutritionistClients(
    @Args('nutritionistId', { type: () => ID }) nutritionistId: string,
  ): Promise<UserType[]> {
    return this.usersService.getClientsForNutritionist(nutritionistId);
  }

  @Mutation(() => UserType)
  async assignTrainer(
    @Args('clientId', { type: () => ID }) clientId: string,
    @Args('trainerId', { type: () => ID }) trainerId: string,
  ): Promise<UserType | null> {
    return this.usersService.assignClientToTrainer(clientId, trainerId);
  }

  @Mutation(() => UserType)
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
  async clientForProfessional(
    @Args('clientId', { type: () => ID }) clientId: string,
    @Args('professionalId', { type: () => ID }) professionalId: string,
  ): Promise<UserType> {
    return this.usersService.getClientForProfessional(clientId, professionalId);
  }
}
