import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/utils/base/base.repository';
import { TrainingDay } from '@/entities';

@Injectable()
export class TrainingDayRepository extends BaseRepository<TrainingDay> {
  constructor(
    @InjectRepository(TrainingDay)
    repository: Repository<TrainingDay>,
  ) {
    super(repository);
  }

  async findByWorkoutId(workoutId: string): Promise<TrainingDay[]> {
    return this.getRepository().find({
      where: { workout_id: workoutId },
      order: { order: 'ASC' },
    });
  }

  async findByWorkoutAndDay(
    workoutId: string,
    dayOfWeek: number,
  ): Promise<TrainingDay | null> {
    return this.getRepository().findOne({
      where: {
        workout_id: workoutId,
        dayOfWeek: dayOfWeek,
      },
    });
  }

  async findOneWithRelations(id: string): Promise<TrainingDay | null> {
    return this.getRepository().findOne({
      where: { id },
      relations: [
        'trainingDayExercises',
        'trainingDayExercises.exercise',
        'trainingDayExercises.repSchemes',
        'trainingDayExercises.restIntervals',
      ],
    });
  }
}
