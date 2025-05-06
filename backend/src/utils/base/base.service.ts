import { FindOneOptions } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from './base.entity';
import { BaseRepository } from './base.repository';

export abstract class BaseService<T extends BaseEntity> {
  constructor(private readonly baseRepository: BaseRepository<T>) {}

  async findAll(): Promise<T[]> {
    return this.baseRepository.findAll();
  }

  async findById(id: string): Promise<T> {
    return this.baseRepository.findById(id);
  }

  async findOne(where: FindOneOptions<T>): Promise<T> {
    return this.baseRepository.findOne(where);
  }

  async create(data: QueryDeepPartialEntity<T>): Promise<T> {
    return this.baseRepository.create(data);
  }

  async update(id: string, data: QueryDeepPartialEntity<T>): Promise<T> {
    return this.baseRepository.update(id, data);
  }

  async upsert(data: QueryDeepPartialEntity<T>): Promise<T> {
    return this.baseRepository.upsert(data);
  }

  async remove(id: string): Promise<boolean> {
    return this.baseRepository.remove(id);
  }
}
