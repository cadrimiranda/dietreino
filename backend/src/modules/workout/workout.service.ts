import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkoutRepository } from './workout.repository';
import { Workout } from '../../entities/workout.entity';
import { WorkoutType } from './workout.type';
import { ImportSheetWorkoutInput } from './dto/import-sheet-workout.input';
import { ImportXlsxUserWorkoutInput } from './dto/import-xlsx-user-workout-input';
import { XlsxService } from '../xlsx/xlsx.service';
import { DataSource } from 'typeorm';
import { TrainingDayService } from '../training-day/training-day.service';
import {
  TrainingDayExerciseService,
  WorkoutExerciseCreateData,
} from '../training-day-exercise/training-day-exercise.service';
import { TrainingDay } from '@/entities';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class WorkoutService {
  constructor(
    private readonly repository: WorkoutRepository,
    private readonly trainingDayService: TrainingDayService,
    private readonly trainingDayExerciseService: TrainingDayExerciseService,
    private readonly xlsxService: XlsxService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  toWorkoutType(workout: Workout): Partial<WorkoutType> {
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
    };
  }

  create(data: Partial<Workout>) {
    return this.repository.create(data);
  }

  findById(id: string) {
    return this.repository.findById(id);
  }

  findAll() {
    return this.repository.findAll();
  }

  update(id: string, data: Partial<Workout>) {
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

  async importXlsxUserWorkout(
    input: ImportXlsxUserWorkoutInput,
  ): Promise<Partial<WorkoutType>> {
    const { file, ...rest } = input;
    const upload = await file;
    const xlsxData = await this.xlsxService.extractWorkoutSheet(upload);

    const importInput: ImportSheetWorkoutInput = {
      ...rest,
      isActive: true,
      sheets: xlsxData,
    };

    return await this.importSheetWorkout(importInput);
  }

  async importSheetWorkout(
    input: ImportSheetWorkoutInput,
  ): Promise<Partial<WorkoutType>> {
    const { workoutId } = input;
    const existingWorkout = workoutId ? await this.findById(workoutId) : null;
    let workout: Workout;

    const week_start = new Date(input.weekStart);
    const week_end = new Date(input.weekEnd);

    if (existingWorkout) {
      workout = (await this.update(existingWorkout.id, {
        name: input.workoutName,
        week_end,
        week_start,
        is_active: input.isActive,
      })) as Workout;
    } else {
      workout = await this.create({
        user: { id: input.userId } as any,
        name: input.workoutName,
        is_active: input.isActive,
        week_end,
        week_start,
      });
    }

    let day = 0;
    let trainingDay: TrainingDay | null = null;
    let trainingDayExercises: WorkoutExerciseCreateData[] = [];
    for (let sheet in input.sheets) {
      const sheetData = input.sheets[sheet];

      trainingDay = await this.trainingDayService.create({
        dayOfWeek: day,
        focus: sheetData.sheetName,
        name: sheetData.sheetName,
        order: day,
        workout,
      });

      for (let i = 0; i < sheetData.exercises.length; i++) {
        const exerciseInfo = sheetData.exercises[i];

        trainingDayExercises.push({
          exerciseName: exerciseInfo.name,
          trainingDayId: trainingDay.id,
          repSchemes: exerciseInfo.repSchemes.map((rs) => ({
            sets: rs.sets,
            max_reps: rs.maxReps,
            min_reps: rs.minReps,
          })),
          restIntervals: exerciseInfo.restIntervals.map((interval, idx) => ({
            interval_time: interval,
            order: idx,
          })),
        });
      }

      await this.trainingDayExerciseService.createBatchByTrainingDay(
        trainingDayExercises,
      );

      trainingDay = null;
      trainingDayExercises = [];
    }

    const createdWorkout = await this.findById(workout.id);
    if (!createdWorkout) {
      throw new NotFoundException(`Workout with ID ${workout.id} not found`);
    }

    return this.toWorkoutType(createdWorkout);
  }
}
