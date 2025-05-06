import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ExerciseService } from './exercise.service';
import { ExerciseType } from './dto/exercise.type';
import { Exercise } from '@/entities';
import { ExerciseUpsertDto } from './dto/exerciseUpsert';

@Resolver(() => ExerciseType)
export class ExercisesResolver {
  constructor(private readonly exerciseService: ExerciseService) {}

  private toExerciseType = (entity: Exercise): ExerciseType => {
    return {
      id: entity.id,
      name: entity.name,
      videoLink: entity.videoLink,
    };
  };

  @Query(() => [ExerciseType])
  async exercises(): Promise<ExerciseType[]> {
    const entities = await this.exerciseService.findAll();
    return entities.map(this.toExerciseType);
  }

  @Query(() => ExerciseType, { nullable: true })
  async exercise(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ExerciseType | null> {
    const entity = await this.exerciseService.findById(id);
    return entity ? this.toExerciseType(entity) : null;
  }

  @Mutation(() => ExerciseType)
  async upsertExercise(
    @Args('input') input: ExerciseUpsertDto,
  ): Promise<ExerciseType> {
    let entity: Exercise | null = null;

    if (input.id) {
      entity = await this.exerciseService.findById(input.id);
      if (entity) {
        entity.name = input.name;
        entity.videoLink = input?.videoLink || entity.videoLink;

        await this.exerciseService.update(input.id, entity);
      }
    }

    if (!entity) {
      entity = await this.exerciseService.create({
        name: input.name,
        videoLink: input.videoLink,
      });
    }

    return this.toExerciseType(entity);
  }

  @Mutation(() => Boolean)
  async deleteExercise(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.exerciseService.delete(id);
    return true;
  }
}
