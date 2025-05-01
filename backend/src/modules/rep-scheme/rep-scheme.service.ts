import { Injectable } from '@nestjs/common';
import { RepSchemeRepository } from './rep-scheme.repository';
import { RepScheme } from '../../entities/rep-scheme.entity';

interface RepSchemeData {
  workout_exercise_id: number;
  sets: number;
  min_reps: number;
  max_reps: number;
}

@Injectable()
export class RepSchemeService {
  constructor(private readonly repository: RepSchemeRepository) {}

  create(data: Partial<RepScheme>) {
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

  update(id: number, data: Partial<RepScheme>) {
    return this.repository.update(id, data);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }

  bulkCreate(dataArray: RepSchemeData[]) {
    return this.repository.bulkCreate(dataArray);
  }
}
