import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkoutRepository } from './workout.repository';
import { Workout } from '../../entities/workout.entity';
import { WorkoutType } from './workout.type';
import { ImportSheetWorkoutInput } from './dto/import-sheet-workout.input';
import { ExerciseService } from '../exercise/exercise.service';
import { WorkoutExerciseService } from '../workout-exercise/workout-exercise.service';
import { ImportXlsxUserWorkoutInput } from './dto/import-xlsx-user-workout-input';
import { XlsxService } from '../xlsx/xlsx.service';
import { Transaction } from 'typeorm';

@Injectable()
export class WorkoutService {
  constructor(
    private readonly repository: WorkoutRepository,
    private readonly exerciseService: ExerciseService,
    private readonly workoutExerciseService: WorkoutExerciseService,
    private readonly xlsxService: XlsxService,
  ) {}

  toWorkoutType(workout: Workout): Partial<WorkoutType> {
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
      // Se o workout já existe, atualize-o
      workout = (await this.update(existingWorkout.id, {
        name: input.workoutName,
        week_end,
        week_start,
        is_active: input.isActive,
      })) as Workout;
    } else {
      // Se o workout não existe, crie um novo
      workout = await this.create({
        user_id: input.userId,
        name: input.workoutName,
        is_active: input.isActive,
        week_end,
        week_start,
      });
    }

    // 2. Processar cada exercício

    for (let sheet in input.sheets) {
      const sheetData = input.sheets[sheet];

      for (let i = 0; i < sheetData.exercises.length; i++) {
        const exerciseInfo = sheetData.exercises[i];

        // 2.1 Verificar se o exercício já existe ou criar um novo
        let exercise = await this.exerciseService.findByName(exerciseInfo.name);

        if (!exercise) {
          exercise = await this.exerciseService.create({
            name: exerciseInfo.name,
            muscle_group: '',
          });
        }

        // 2.2 Criar o workout_exercise com seus relacionamentos
        await this.workoutExerciseService.createWithRelationships({
          workout,
          exercise,
          order: i + 1,
          sets: exerciseInfo.repSchemes[0]?.sets || 0,
          repSchemes: exerciseInfo.repSchemes.map((rs) => ({
            sets: rs.sets,
            min_reps: rs.minReps,
            max_reps: rs.maxReps,
          })),
          restIntervals: exerciseInfo.restIntervals.map((interval, idx) => ({
            interval_time: interval,
            order: idx + 1,
          })),
        });
      }
    }

    // 3. Buscar e retornar o workout completo
    const createdWorkout = await this.findById(workout.id);
    if (!createdWorkout) {
      throw new NotFoundException(`Workout with ID ${workout.id} not found`);
    }

    return this.toWorkoutType(createdWorkout);
  }
}
