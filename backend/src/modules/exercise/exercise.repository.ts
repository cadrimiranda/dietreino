import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../../entities/exercise.entity';

@Injectable()
export class ExerciseRepository {
  constructor(
    @InjectRepository(Exercise)
    private readonly repository: Repository<Exercise>,
  ) {}

  async findByName(name: string): Promise<Exercise | null> {
    return this.repository.findOne({ where: { name } });
  }

  async create(data: Partial<Exercise>): Promise<Exercise> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<Exercise | null> {
    return this.repository.findOneBy({ id });
  }

  async findAll(): Promise<Exercise[]> {
    return this.repository.find();
  }

  async update(id: string, data: Partial<Exercise>): Promise<Exercise | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
