import { Injectable } from '@nestjs/common';
import { WorkoutRepository } from './workout.repository';
import { Workout } from '../../entities/workout.entity';
import { WorkoutType } from './workout.type';

@Injectable()
export class WorkoutService {
  toWorkoutType(workout: Workout): WorkoutType {
    return {
      id: workout.id,
      userId: workout.user_id,
      name: workout.name,
      weekStart: workout.week_start,
      weekEnd: workout.week_end,
      isActive: workout.is_active,
      createdAt: workout.created_at,
    };
  }
  constructor(private readonly repository: WorkoutRepository) {}

  create(data: Partial<Workout>) {
    return this.repository.create(data);
  }

  findById(id: number) {
    return this.repository.findById(id);
  }

  findAll() {
    return this.repository.findAll();
  }

  update(id: number, data: Partial<Workout>) {
    return this.repository.update(id, data);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }

  findByUserId(userId: string) {
    return this.repository.findByUserId(userId);
  }
}
