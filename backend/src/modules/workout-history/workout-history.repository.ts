import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutHistory } from '../../entities/workout-history.entity';

@Injectable()
export class WorkoutHistoryRepository {
  constructor(
    @InjectRepository(WorkoutHistory)
    private readonly repository: Repository<WorkoutHistory>,
  ) {}

  async create(
    workoutHistory: Partial<WorkoutHistory>,
  ): Promise<WorkoutHistory> {
    const entity = this.repository.create(workoutHistory);
    return this.repository.save(entity);
  }

  async findAll(): Promise<WorkoutHistory[]> {
    return this.repository.find({
      relations: [
        'user',
        'workout',
        'workoutHistoryExercises',
        'workoutHistoryExercises.exercise',
        'workoutHistoryExercises.workoutHistoryExerciseSets',
      ],
      order: { executedAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<WorkoutHistory | null> {
    return this.repository.findOne({
      where: { id },
      relations: [
        'user',
        'workout',
        'workoutHistoryExercises',
        'workoutHistoryExercises.exercise',
        'workoutHistoryExercises.workoutHistoryExerciseSets',
      ],
    });
  }

  async findByUserId(userId: string): Promise<WorkoutHistory[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      relations: [
        'workout',
        'workoutHistoryExercises',
        'workoutHistoryExercises.exercise',
        'workoutHistoryExercises.workoutHistoryExerciseSets',
      ],
      order: { executedAt: 'DESC' },
    });
  }

  async findByWorkoutId(workoutId: string): Promise<WorkoutHistory[]> {
    return this.repository.find({
      where: { workout: { id: workoutId } },
      relations: [
        'user',
        'workoutHistoryExercises',
        'workoutHistoryExercises.exercise',
        'workoutHistoryExercises.workoutHistoryExerciseSets',
      ],
      order: { executedAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updates: Partial<WorkoutHistory>,
  ): Promise<WorkoutHistory | null> {
    await this.repository.update(id, updates);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
