import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkoutRepository } from './workout.repository';
import { Workout } from '../../entities/workout.entity';
import { WorkoutType } from './workout.type';
import { ImportSheetWorkoutInput } from './dto/import-sheet-workout.input';
import { ExerciseService } from '../exercise/exercise.service';
import { WorkoutExerciseService } from '../workout-exercise/workout-exercise.service';

@Injectable()
export class WorkoutService {
  constructor(
    private readonly repository: WorkoutRepository,
    private readonly exerciseService: ExerciseService,
    private readonly workoutExerciseService: WorkoutExerciseService,
  ) {}

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

  async importSheetWorkout(
    input: ImportSheetWorkoutInput,
  ): Promise<WorkoutType> {
    // 1. Criar o workout
    const workout = await this.create({
      user_id: input.userId,
      name: input.workoutName,
      week_start: input.weekStart,
      week_end: input.weekEnd,
      is_active: input.isActive,
    });

    // 2. Processar cada exercício
    for (let i = 0; i < input.exercises.length; i++) {
      const exerciseInfo = input.exercises[i];

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
        workout_id: workout.id,
        exercise_id: exercise.id,
        order: i + 1,
        sets: exerciseInfo.repSchemes[0]?.sets || 0,
        repetitions: this.formatRepetitions(exerciseInfo.repSchemes),
        raw_reps: exerciseInfo.rawReps,
        rest: exerciseInfo.restIntervals.join(', '),
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

    // 3. Buscar e retornar o workout completo
    const createdWorkout = await this.findById(workout.id);
    if (!createdWorkout) {
      throw new NotFoundException(`Workout with ID ${workout.id} not found`);
    }

    return this.toWorkoutType(createdWorkout);
  }

  private formatRepetitions(
    repSchemes: { sets: number; minReps: number; maxReps: number }[],
  ): string {
    return repSchemes
      .map((scheme) => {
        if (scheme.minReps === scheme.maxReps) {
          return `${scheme.sets}x${scheme.minReps}`;
        } else {
          return `${scheme.sets}x${scheme.minReps}-${scheme.maxReps}`;
        }
      })
      .join(' / ');
  }
}
