import {
  Repository,
  FindOptionsWhere,
  DeepPartial,
  FindOneOptions,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseEntity } from './base.entity';
import { NotFoundException } from '@nestjs/common';

export abstract class BaseRepository<T extends BaseEntity> {
  constructor(private readonly repository: Repository<T>) {}

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }

    return entity;
  }

  async findOne(where: FindOneOptions<T>): Promise<T> {
    const entity = await this.repository.findOne(where);

    if (!entity) {
      throw new NotFoundException(
        `Entity not found with the specified criteria`,
      );
    }

    return entity;
  }

  async create(data: QueryDeepPartialEntity<T>): Promise<T> {
    const entity = this.repository.create(data as DeepPartial<T>);
    return this.repository.save(entity);
  }

  async update(id: string, data: QueryDeepPartialEntity<T>): Promise<T> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async upsert(data: QueryDeepPartialEntity<T>): Promise<T> {
    const id = (data as any).id;

    if (id) {
      try {
        await this.findById(id);
        return this.update(id, data);
      } catch (error) {
        if (error instanceof NotFoundException) {
          return this.create(data);
        }
        throw error;
      }
    }

    return this.create(data);
  }

  async remove(id: string): Promise<boolean> {
    const entity = await this.findById(id);
    await this.repository.remove(entity);
    return true;
  }

  getRepository() {
    return this.repository;
  }
}
