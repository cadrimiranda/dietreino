import { Injectable } from '@nestjs/common';
import { ExerciseRepository } from './exercise.repository';
import { Exercise } from '../../entities/exercise.entity';

@Injectable()
export class ExerciseService {
  constructor(private readonly repository: ExerciseRepository) {}

  create(data: Partial<Exercise>) {
    return this.repository.create(data);
  }

  findById(id: string) {
    return this.repository.findById(id);
  }

  findAll() {
    return this.repository.findAll();
  }

  update(id: string, data: Partial<Exercise>) {
    return this.repository.update(id, data);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }

  async findByName(name: string): Promise<Exercise | null> {
    return this.repository.findByName(name);
  }
}
