import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestInterval } from '../../entities/rest-interval.entity';
import { RestIntervalUpsertDto } from './dto/restIntervalUpsert';

@Injectable()
export class RestIntervalRepository {
  constructor(
    @InjectRepository(RestInterval)
    private readonly repository: Repository<RestInterval>,
  ) {}

  async create(data: Partial<RestInterval>): Promise<RestInterval> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<RestInterval | null> {
    return this.repository.findOneBy({ id });
  }

  async findByTrainingDayExercise(
    trainingDayExerciseId: string,
  ): Promise<RestInterval[]> {
    return this.repository.find({
      where: {
        trainingDayExercise: {
          id: trainingDayExerciseId,
        },
      },
      order: { order: 'ASC' },
    });
  }

  async findAll(): Promise<RestInterval[]> {
    return this.repository.find();
  }

  async update(
    id: string,
    data: Partial<RestInterval>,
  ): Promise<RestInterval | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async bulkCreate(
    dataArray: Partial<RestInterval>[],
  ): Promise<RestInterval[]> {
    const entities = this.repository.create(dataArray);
    return this.repository.save(entities);
  }
}
