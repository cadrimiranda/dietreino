import { Injectable } from '@nestjs/common';
import { WeeklyLoadRepository } from './weekly-load.repository';
import { WeeklyLoad } from '@/entities';

@Injectable()
export class WeeklyLoadService {
  constructor(private readonly repository: WeeklyLoadRepository) {}

  create(data: Omit<WeeklyLoad, 'id'>) {
    return this.repository.create(data);
  }

  findById(id: string) {
    return this.repository.findById(id);
  }

  findAll() {
    return this.repository.findAll();
  }

  update(id: string, data: WeeklyLoad) {
    return this.repository.update(id, data);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
