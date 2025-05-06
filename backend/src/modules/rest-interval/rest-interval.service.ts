import { Injectable } from '@nestjs/common';
import { RestIntervalRepository } from './rest-interval.repository';
import { RestInterval } from '../../entities/rest-interval.entity';
import { RestIntervalUpsertDto } from './dto/restIntervalUpsert';

@Injectable()
export class RestIntervalService {
  constructor(private readonly repository: RestIntervalRepository) {}

  create(data: Partial<RestInterval>) {
    return this.repository.create(data);
  }

  findById(id: string) {
    return this.repository.findById(id);
  }

  findByTrainingDayExercise(trainingDayExerciseId: string) {
    return this.repository.findByTrainingDayExercise(trainingDayExerciseId);
  }

  findAll() {
    return this.repository.findAll();
  }

  update(id: string, data: Partial<RestInterval>) {
    return this.repository.update(id, data);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }

  bulkCreate(dataArray: RestIntervalUpsertDto[]) {
    return this.repository.bulkCreate(
      dataArray.map((data) => ({
        trainingDayExercise: { id: data.trainingDayExerciseId } as any,
        intervalTime: data.intervalTime,
        order: data.order,
      })),
    );
  }
}
