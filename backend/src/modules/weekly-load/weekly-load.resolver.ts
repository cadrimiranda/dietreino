import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { WeeklyLoadService } from './weekly-load.service';
import { WeeklyLoadType } from './dto/weekly-load.type';
import { WeeklyLoad } from '../../entities/weekly-load.entity';
import { WeeklyLoadUpsertDto } from './dto/weeklyLoadUpsert';

@Resolver(() => WeeklyLoadType)
export class WeeklyLoadResolver {
  constructor(private readonly service: WeeklyLoadService) {}

  private toType = (entity: WeeklyLoad): WeeklyLoadType => {
    return {
      id: entity.id,
      trainingDayExerciseId: entity.trainingDayExercise.id,
      week: entity.week,
      load: entity.load,
    };
  };

  @Query(() => [WeeklyLoadType])
  async weeklyLoads(): Promise<WeeklyLoadType[]> {
    const entities = await this.service.findAll();
    return entities.map(this.toType);
  }

  @Query(() => WeeklyLoadType, { nullable: true })
  async weeklyLoad(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<WeeklyLoadType | null> {
    const entity = await this.service.findById(id);
    return entity ? this.toType(entity) : null;
  }

  @Mutation(() => WeeklyLoadType, { nullable: true })
  async upsert(
    @Args('input') input: WeeklyLoadUpsertDto,
  ): Promise<WeeklyLoadType | null> {
    let entity: WeeklyLoad | null = null;

    if (input.id) {
      entity = await this.service.findById(input.id);
      if (entity) {
        entity.load = input.load;
        entity.trainingDayExercise = { id: input.trainingDayExerciseId } as any;
        entity.week = input.week;

        await await this.service.update(input.id, entity);
      }
    }

    if (!entity) {
      entity = await this.service.create({
        trainingDayExercise: { id: input.trainingDayExerciseId } as any,
        week: input.week,
        load: input.load,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return this.toType(entity);
  }

  @Mutation(() => Boolean)
  async deleteWeeklyLoad(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.service.delete(id);
    return true;
  }
}
