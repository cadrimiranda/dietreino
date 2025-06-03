import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkoutRepository } from './workout.repository';
import { Workout } from '../../entities/workout.entity';
import { WorkoutType } from './workout.type';
import { ImportSheetWorkoutInput } from './dto/import-sheet-workout.input';
import { ImportXlsxUserWorkoutInput } from './dto/import-xlsx-user-workout-input';
import { UpdateWorkoutExercisesInput } from './dto/update-workout-exercises.input';
import { CreateWorkoutInput } from './dto/create-workout.input';
import { XlsxService } from '../xlsx/xlsx.service';
import { DataSource } from 'typeorm';
import { TrainingDayService } from '../training-day/training-day.service';
import {
  TrainingDayExerciseService,
  WorkoutExerciseCreateData,
} from '../training-day-exercise/training-day-exercise.service';
import {
  TrainingDay,
  TrainingDayExercise,
  RepScheme,
  RestInterval,
  User,
  Exercise,
} from '@/entities';
import { InjectDataSource } from '@nestjs/typeorm';
import { ExerciseService } from '../exercise/exercise.service';

@Injectable()
export class WorkoutService {
  constructor(
    private readonly repository: WorkoutRepository,
    private readonly trainingDayService: TrainingDayService,
    private readonly trainingDayExerciseService: TrainingDayExerciseService,
    private readonly xlsxService: XlsxService,
    private readonly exerciseService: ExerciseService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  private logTransactionError(operation: string, error: any, context?: any) {
    console.error(`[TRANSACTION ERROR] ${operation}:`, {
      error: error.message || error,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  toWorkoutType(workout: Workout): WorkoutType {
    return {
      id: workout.id,
      userId: workout.user.id,
      name: workout.name,
      weekStart: workout.week_start,
      weekEnd: workout.week_end,
      isActive: workout.is_active,
      createdAt: workout.createdAt,
      trainingDaysBitfield: workout.trainingDaysBitfield,
      trainingDays: workout.trainingDays,
      startedAt: workout.startedAt,
    };
  }

  async create(data: Partial<Workout>) {
    // If creating an active workout, deactivate all other workouts for this user
    if (data.is_active && data.user?.id) {
      await this.deactivateAllUserWorkouts(data.user.id);
    }
    return this.repository.create(data);
  }

  findById(id: string) {
    return this.repository.findById(id);
  }

  findAll() {
    return this.repository.findAll();
  }

  async update(id: string, data: Partial<Workout>) {
    // If activating a workout, deactivate all other workouts for this user
    if (data.is_active) {
      const workout = await this.findById(id);
      if (workout && workout.user?.id) {
        await this.deactivateAllUserWorkouts(workout.user.id, id);
      }
    }
    return this.repository.update(id, data);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }

  findByUserId(userId: string) {
    return this.repository
      .findByUserId(userId)
      .then((workouts) => workouts.map(this.toWorkoutType));
  }

  /**
   * Deactivates all workouts for a specific user
   * @param userId The user ID
   * @param excludeWorkoutId Optional workout ID to exclude from deactivation
   */
  async deactivateAllUserWorkouts(userId: string, excludeWorkoutId?: string) {
    const workouts = await this.repository.findByUserId(userId);

    for (const workout of workouts) {
      if (excludeWorkoutId && workout.id === excludeWorkoutId) {
        continue;
      }

      if (workout.is_active) {
        await this.repository.update(workout.id, { is_active: false });
      }
    }
  }

  /**
   * Toggles a workout's active status and ensures only one workout is active per user
   * @param workoutId The workout ID to toggle
   * @param active The new active status
   */
  async toggleWorkoutActive(
    workoutId: string,
    active: boolean,
  ): Promise<Workout> {
    const workout = await this.findById(workoutId);
    if (!workout) {
      throw new NotFoundException(`Workout with ID ${workoutId} not found`);
    }

    // If activating, deactivate all other workouts for this user
    if (active && workout.user?.id) {
      await this.deactivateAllUserWorkouts(workout.user.id, workoutId);
    }

    // Update the workout's active status
    return this.repository.update(workoutId, {
      is_active: active,
    }) as Promise<Workout>;
  }

  async importXlsxUserWorkout(
    input: ImportXlsxUserWorkoutInput,
  ): Promise<Partial<WorkoutType>> {
    const upload = await input.file;
    const xlsxData = await this.xlsxService.extractWorkoutSheet(upload);

    const importInput: ImportSheetWorkoutInput = {
      userId: input.userId,
      workoutId: input.workoutId,
      workoutName: input.workoutName,
      weekStart: input.weekStart,
      weekEnd: input.weekEnd,
      isActive: true,
      sheets: xlsxData,
    };

    return await this.importSheetWorkout(importInput);
  }

  async importSheetWorkout(
    input: ImportSheetWorkoutInput,
  ): Promise<Partial<WorkoutType>> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const { workoutId } = input;
      const existingWorkout = workoutId ? await this.findById(workoutId) : null;
      let workout: Workout;

      const week_start = new Date(input.weekStart);
      const week_end = new Date(input.weekEnd);

      // If this workout will be active, deactivate all other workouts for this user (within transaction)
      if (input.isActive) {
        await queryRunner.manager
          .createQueryBuilder()
          .update('workout')
          .set({ is_active: false })
          .where('user_id = :userId AND is_active = true', {
            userId: input.userId,
          })
          .andWhere(workoutId ? 'id != :workoutId' : '1=1', { workoutId })
          .execute();
      }

      if (existingWorkout) {
        // Update existing workout within transaction
        const updatedWorkout = await queryRunner.manager.save('workout', {
          id: existingWorkout.id,
          name: input.workoutName,
          week_end,
          week_start,
          is_active: input.isActive,
          updated_at: new Date(),
        });
        workout = { ...existingWorkout, ...updatedWorkout } as Workout;
      } else {
        // Create new workout within transaction
        const savedWorkout = await queryRunner.manager.save(Workout, {
          user: { id: input.userId } as User,
          name: input.workoutName,
          is_active: input.isActive,
          week_end,
          week_start,
        });
        workout = savedWorkout;
      }

      let day = 0;
      for (const sheetData of input.sheets) {
        // Create training day within transaction
        const trainingDay = await queryRunner.manager.save(TrainingDay, {
          dayOfWeek: day,
          focus: sheetData.sheetName,
          name: sheetData.sheetName,
          order: day,
          workout: { id: workout.id } as Workout,
        });

        // Process exercises for this training day
        for (let i = 0; i < sheetData.exercises.length; i++) {
          const exerciseInfo = sheetData.exercises[i];

          // Find or create exercise
          let exercise = await queryRunner.manager.findOne(Exercise, {
            where: { name: exerciseInfo.name },
          });

          if (!exercise) {
            exercise = await queryRunner.manager.save(Exercise, {
              name: exerciseInfo.name,
            });
          }

          // Calculate total sets
          const totalSets = exerciseInfo.repSchemes.reduce(
            (sum, rs) => sum + rs.sets,
            0,
          );

          // Create training day exercise
          const trainingDayExercise = await queryRunner.manager.save(TrainingDayExercise, {
            trainingDay: { id: trainingDay.id } as TrainingDay,
            exercise: { id: exercise.id } as Exercise,
            order: i,
            sets: totalSets || 1,
          });

          // Create rep schemes
          for (const rs of exerciseInfo.repSchemes) {
            await queryRunner.manager.save(RepScheme, {
              trainingDayExercise: { id: trainingDayExercise.id } as TrainingDayExercise,
              sets: rs.sets,
              minReps: rs.minReps,
              maxReps: rs.maxReps,
            });
          }

          // Create rest intervals
          for (let idx = 0; idx < exerciseInfo.restIntervals.length; idx++) {
            const interval = exerciseInfo.restIntervals[idx];
            await queryRunner.manager.save(RestInterval, {
              trainingDayExercise: { id: trainingDayExercise.id } as TrainingDayExercise,
              intervalTime: interval,
              order: idx,
            });
          }
        }

        day++;
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Retrieve the created/updated workout with all relations
      const createdWorkout = await this.findById((workout as any).id);
      if (!createdWorkout) {
        throw new NotFoundException(
          `Workout with ID ${workout.id} not found after transaction commit`,
        );
      }

      return this.toWorkoutType(createdWorkout);
    } catch (error) {
      // Rollback transaction in case of any error
      await queryRunner.rollbackTransaction();

      // Log the error for debugging
      this.logTransactionError('importSheetWorkout', error, {
        userId: input.userId,
        workoutName: input.workoutName,
        workoutId: input.workoutId,
        sheetsCount: Object.keys(input.sheets).length,
      });

      // Re-throw the error to be handled by the caller
      throw error;
    } finally {
      // Always release the query runner
      await queryRunner.release();
    }
  }

  async updateWorkoutExercises(
    input: UpdateWorkoutExercisesInput,
  ): Promise<Workout> {
    const workout = await this.findById(input.workoutId);
    if (!workout) {
      throw new NotFoundException(
        `Workout with ID ${input.workoutId} not found`,
      );
    }

    // Check if workout has already been started
    if (workout.startedAt) {
      throw new Error('Não é possível editar um treino que já foi iniciado.');
    }

    // Use a transaction to ensure data consistency
    const result = await this.dataSource.transaction(async (manager) => {
      // Delete existing training days and their exercises
      const existingTrainingDays = workout.trainingDays || [];
      for (const td of existingTrainingDays) {
        await manager.delete(TrainingDay, { id: td.id });
      }

      // Create new training days with exercises
      for (const tdInput of input.trainingDays) {
        const trainingDay = await manager.save(TrainingDay, {
          name: tdInput.name,
          order: tdInput.order,
          dayOfWeek: tdInput.dayOfWeek,
          workout: { id: workout.id },
        });

        // Create exercises for this training day
        for (const exInput of tdInput.exercises) {
          const exercise = await this.exerciseService.findById(
            exInput.exerciseId,
          );
          if (!exercise) {
            throw new NotFoundException(
              `Exercise with ID ${exInput.exerciseId} not found`,
            );
          }

          // Calculate total sets from rep schemes
          const totalSets = exInput.repSchemes.reduce(
            (sum, rs) => sum + rs.sets,
            0,
          );

          const trainingDayExercise = await manager.save(TrainingDayExercise, {
            order: exInput.order,
            sets: totalSets || 1, // default to 1 if no rep schemes
            trainingDay: { id: trainingDay.id },
            exercise: { id: exercise.id },
          });

          // Create rep schemes
          for (const rsInput of exInput.repSchemes) {
            await manager.save(RepScheme, {
              sets: rsInput.sets,
              minReps: rsInput.minReps,
              maxReps: rsInput.maxReps,
              trainingDayExercise: { id: trainingDayExercise.id },
            });
          }

          // Create rest intervals
          for (const riInput of exInput.restIntervals) {
            await manager.save(RestInterval, {
              intervalTime: riInput.intervalTime,
              order: riInput.order,
              trainingDayExercise: { id: trainingDayExercise.id },
            });
          }
        }
      }

      // Return the updated workout
      return await this.findById(workout.id);
    });

    if (!result) {
      throw new NotFoundException(
        `Failed to update workout with ID ${input.workoutId}`,
      );
    }

    return result;
  }

  async createWorkout(input: CreateWorkoutInput): Promise<Workout> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const week_start = new Date(input.weekStart);
      const week_end = new Date(input.weekEnd);

      // Deactivate all existing workouts for this user (within transaction)
      await queryRunner.manager
        .createQueryBuilder()
        .update('workout')
        .set({ is_active: false })
        .where('user_id = :userId AND is_active = true', {
          userId: input.userId,
        })
        .execute();

      // Create the workout using queryRunner manager
      const workout = await queryRunner.manager.save('workout', {
        user_id: input.userId,
        name: input.name,
        is_active: true,
        week_end,
        week_start,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Create training days and exercises using queryRunner manager
      for (const trainingDayInput of input.trainingDays) {
        // Create training day
        const trainingDay = await queryRunner.manager.save('training_days', {
          day_of_week: trainingDayInput.dayOfWeek,
          focus: trainingDayInput.name,
          name: trainingDayInput.name,
          order: trainingDayInput.order,
          workout_id: (workout as any).id,
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Create exercises for this training day
        for (const exerciseInput of trainingDayInput.exercises) {
          // Verify exercise exists before proceeding
          const exercise = await queryRunner.manager.findOne('exercises', {
            where: { id: exerciseInput.exerciseId },
          });

          if (!exercise) {
            throw new NotFoundException(
              `Exercise with ID ${exerciseInput.exerciseId} not found`,
            );
          }

          // Calculate total sets from rep schemes
          const totalSets = exerciseInput.repSchemes.reduce(
            (sum, rs) => sum + rs.sets,
            0,
          );

          // Create training day exercise
          const trainingDayExercise = await queryRunner.manager.save(
            'training_day_exercises',
            {
              training_day_id: (trainingDay as any).id,
              exercise_id: (exercise as any).id,
              order: exerciseInput.order,
              sets: totalSets || 1,
              created_at: new Date(),
              updated_at: new Date(),
            },
          );

          // Create rep schemes
          for (const repSchemeInput of exerciseInput.repSchemes) {
            await queryRunner.manager.save('rep_schemes', {
              training_day_exercise_id: (trainingDayExercise as any).id,
              sets: repSchemeInput.sets,
              min_reps: repSchemeInput.minReps,
              max_reps: repSchemeInput.maxReps,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }

          // Create rest intervals
          for (const restIntervalInput of exerciseInput.restIntervals) {
            await queryRunner.manager.save('rest_intervals', {
              training_day_exercise_id: (trainingDayExercise as any).id,
              interval_time: restIntervalInput.intervalTime,
              order: restIntervalInput.order,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }
        }
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Retrieve the created workout with all relations
      const createdWorkout = await this.findById((workout as any).id);
      if (!createdWorkout) {
        throw new Error(
          'Failed to retrieve created workout after transaction commit',
        );
      }

      return createdWorkout;
    } catch (error) {
      // Rollback transaction in case of any error
      await queryRunner.rollbackTransaction();

      // Log the error for debugging
      this.logTransactionError('createWorkout', error, {
        userId: input.userId,
        workoutName: input.name,
        trainingDaysCount: input.trainingDays.length,
      });

      // Re-throw the error to be handled by the caller
      throw error;
    } finally {
      // Always release the query runner
      await queryRunner.release();
    }
  }
}
