import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepScheme } from '../../entities/rep-scheme.entity';
import { RepSchemeUpsertDto } from './dto/repSchemeUpsert';

@Injectable()
export class RepSchemeRepository {
  constructor(
    @InjectRepository(RepScheme)
    private readonly repository: Repository<RepScheme>,
  ) {}

  async create(data: Partial<RepScheme>): Promise<RepScheme> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<RepScheme | null> {
    return this.repository.findOneBy({ id });
  }

  async findByTrainingDayExercise(
    trainingDayExerciseId: string,
  ): Promise<RepScheme[]> {
    return this.repository.find({
      where: {
        trainingDayExercise: {
          id: trainingDayExerciseId,
        },
      },
      order: { id: 'ASC' },
    });
  }

  async findAll(): Promise<RepScheme[]> {
    return this.repository.find();
  }

  async update(
    id: string,
    data: Partial<RepScheme>,
  ): Promise<RepScheme | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async bulkCreate(dataArray: RepSchemeUpsertDto[]): Promise<RepScheme[]> {
    const entities = this.repository.create(dataArray);
    return this.repository.save(entities);
  }
}
