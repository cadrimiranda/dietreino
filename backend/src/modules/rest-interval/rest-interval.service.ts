import { Injectable } from '@nestjs/common';
import { RestIntervalRepository } from './rest-interval.repository';
import { RestInterval } from '../../entities/rest-interval.entity';

interface RestIntervalData {
  workout_exercise_id: number;
  interval_time: string;
  order: number;
}

@Injectable()
export class RestIntervalService {
  constructor(private readonly repository: RestIntervalRepository) {}

  create(data: Partial<RestInterval>) {
    return this.repository.create(data);
  }

  findById(id: number) {
    return this.repository.findById(id);
  }

  findByWorkoutExerciseId(workoutExerciseId: number) {
    return this.repository.findByWorkoutExerciseId(workoutExerciseId);
  }

  findAll() {
    return this.repository.findAll();
  }

  update(id: number, data: Partial<RestInterval>) {
    return this.repository.update(id, data);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }

  bulkCreate(dataArray: RestIntervalData[]) {
    return this.repository.bulkCreate(dataArray);
  }
}
