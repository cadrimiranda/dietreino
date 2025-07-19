import { Injectable } from '@nestjs/common';
import { TrainingDayRepository } from './training-day.repository';
import { TrainingDay } from '@/entities';
import { BaseService } from '@/utils/base/base.service';

@Injectable()
export class TrainingDayService extends BaseService<TrainingDay> {
  constructor(private readonly trainingDayRepository: TrainingDayRepository) {
    super(trainingDayRepository);
  }

  async findByWorkoutId(workoutId: string): Promise<TrainingDay[]> {
    return this.trainingDayRepository.findByWorkoutId(workoutId);
  }
}
