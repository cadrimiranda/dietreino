import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { WorkoutHistoryRepository } from './workout-history.repository';
import { WorkoutHistory } from '../../entities/workout-history.entity';
import { WorkoutHistoryExercise } from '../../entities/workout-history-exercise.entity';
import { WorkoutHistoryExerciseSet } from '../../entities/workout-history-exercise-set.entity';
import { WorkoutHistorySummaryType } from './dto/workout-history-summary.type';
import { WorkoutHistoryType } from './dto/workout-history.type';
import { CreateWorkoutHistoryInput } from './dto/create-workout-history.input';

@Injectable()
export class WorkoutHistoryService {
  constructor(
    private readonly repository: WorkoutHistoryRepository,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findAll(): Promise<WorkoutHistory[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<WorkoutHistory | null> {
    return this.repository.findById(id);
  }

  async findByUserId(userId: string): Promise<WorkoutHistory[]> {
    return this.repository.findByUserId(userId);
  }

  async findSummariesByUserId(userId: string): Promise<WorkoutHistory[]> {
    return this.repository.findSummariesByUserId(userId);
  }

  async findByWorkoutId(workoutId: string): Promise<WorkoutHistory[]> {
    return this.repository.findByWorkoutId(workoutId);
  }

  async findByUserIdAndDate(
    userId: string,
    date: Date,
  ): Promise<WorkoutHistory[]> {
    return this.repository.findByUserIdAndDate(userId, date);
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<WorkoutHistory[]> {
    return this.repository.findByUserIdAndDateRange(userId, startDate, endDate);
  }

  async create(input: CreateWorkoutHistoryInput): Promise<WorkoutHistory> {
    return this.dataSource.transaction(async (manager) => {
      try {
        // Create workout history
        const workoutHistory = manager.create(WorkoutHistory, {
          user: { id: input.userId },
          workout: { id: input.workoutId },
          executedAt: input.executedAt,
          workoutName: input.workoutName,
          trainingDayOrder: input.trainingDayOrder,
          trainingDayName: input.trainingDayName,
          notes: input.notes,
          durationMinutes: input.durationMinutes,
        });

        const savedWorkoutHistory = await manager.save(workoutHistory);

        // Create exercises and sets
        for (const exerciseInput of input.exercises) {
          const workoutHistoryExercise = manager.create(
            WorkoutHistoryExercise,
            {
              workoutHistory: savedWorkoutHistory,
              exercise: { id: exerciseInput.exerciseId },
              order: exerciseInput.order,
              exerciseName: exerciseInput.exerciseName,
              plannedSets: exerciseInput.plannedSets,
              completedSets: exerciseInput.completedSets,
              notes: exerciseInput.notes,
            },
          );

          const savedExercise = await manager.save(workoutHistoryExercise);

          // Create sets
          for (const setInput of exerciseInput.sets) {
            const workoutHistoryExerciseSet = manager.create(
              WorkoutHistoryExerciseSet,
              {
                workoutHistoryExercise: savedExercise,
                setNumber: setInput.setNumber,
                weight: setInput.weight,
                reps: setInput.reps,
                plannedRepsMin: setInput.plannedRepsMin,
                plannedRepsMax: setInput.plannedRepsMax,
                restSeconds: setInput.restSeconds,
                isCompleted: setInput.isCompleted,
                isFailure: setInput.isFailure,
                notes: setInput.notes,
                executedAt: setInput.executedAt,
              },
            );

            await manager.save(workoutHistoryExerciseSet);
          }
        }

        // Return the complete workout history with relations
        const result = await manager.findOne(WorkoutHistory, {
          where: { id: savedWorkoutHistory.id },
          relations: [
            'user',
            'workout',
            'workoutHistoryExercises',
            'workoutHistoryExercises.exercise',
            'workoutHistoryExercises.workoutHistoryExerciseSets',
          ],
        });

        if (!result) {
          throw new Error('Failed to create workout history');
        }

        return result;
      } catch (error) {
        console.error('[TRANSACTION ERROR] Create workout history:', error);
        throw error;
      }
    });
  }

  async update(
    id: string,
    updates: Partial<WorkoutHistory>,
  ): Promise<WorkoutHistory | null> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Workout history with ID ${id} not found`);
    }
    return this.repository.update(id, updates);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Workout history with ID ${id} not found`);
    }
    return this.repository.delete(id);
  }

  toWorkoutHistorySummaryType(
    entity: WorkoutHistory,
  ): Partial<WorkoutHistorySummaryType> {
    return {
      id: entity.id.toString(),

      executedAt: entity.executedAt,
      workoutName: entity.workoutName,
      trainingDayOrder: entity.trainingDayOrder,
      trainingDayName: entity.trainingDayName,
      notes: entity.notes,
      durationMinutes: entity.durationMinutes,
    };
  }
  toWorkoutHistoryType(entity: WorkoutHistory): Partial<WorkoutHistoryType> {
    return {
      id: entity.id.toString(),
      userId: entity.user?.id.toString(),
      workoutId: entity.workout?.id.toString(),
      executedAt: entity.executedAt,
      workoutName: entity.workoutName,
      trainingDayOrder: entity.trainingDayOrder,
      trainingDayName: entity.trainingDayName,
      notes: entity.notes,
      durationMinutes: entity.durationMinutes,
      workoutHistoryExercises:
        entity.workoutHistoryExercises?.map((exercise) => ({
          id: exercise.id.toString(),
          workoutHistoryId: exercise.workoutHistoryId.toString(),
          exerciseId: exercise.exerciseId,
          order: exercise.order,
          exerciseName: exercise.exerciseName,
          plannedSets: exercise.plannedSets,
          completedSets: exercise.completedSets,
          notes: exercise.notes,
          workoutHistoryExerciseSets:
            exercise.workoutHistoryExerciseSets?.map((set) => ({
              id: set.id.toString(),
              workoutHistoryExerciseId: set.workoutHistoryExerciseId.toString(),
              setNumber: set.setNumber,
              weight: set.weight,
              reps: set.reps,
              plannedRepsMin: set.plannedRepsMin,
              plannedRepsMax: set.plannedRepsMax,
              restSeconds: set.restSeconds,
              isCompleted: set.isCompleted,
              isFailure: set.isFailure,
              notes: set.notes,
              executedAt: set.executedAt,
              createdAt: set.createdAt,
              updatedAt: set.updatedAt,
            })) || [],
          createdAt: exercise.createdAt,
          updatedAt: exercise.updatedAt,
        })) || [],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
