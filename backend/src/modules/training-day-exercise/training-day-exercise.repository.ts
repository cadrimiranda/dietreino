import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainingDayExercise } from '@/entities';
import { BaseRepository } from '@/utils/base/base.repository';
import { Repository } from 'typeorm';

@Injectable()
export class TrainingDayExerciseRepository extends BaseRepository<TrainingDayExercise> {
  constructor(
    @InjectRepository(TrainingDayExercise)
    repository: Repository<TrainingDayExercise>,
  ) {
    super(repository);
  }
}
