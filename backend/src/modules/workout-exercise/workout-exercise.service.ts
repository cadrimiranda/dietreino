import { Injectable } from '@nestjs/common';
import { WorkoutExerciseRepository } from './workout-exercise.repository';
import { WorkoutExercise } from '../../entities/workout-exercise.entity';
import { RepSchemeService } from '../rep-scheme/rep-scheme.service';
import { RestIntervalService } from '../rest-interval/rest-interval.service';

interface RepSchemeData {
  sets: number;
  min_reps: number;
  max_reps: number;
}

interface RestIntervalData {
  interval_time: string;
  order: number;
}

interface WorkoutExerciseCreateData {
  workout_id: number;
  exercise_id: number;
  order: number;
  sets: number;
  repetitions: string;
  raw_reps?: string;
  rest: string;
  notes?: string;
  repSchemes?: RepSchemeData[];
  restIntervals?: RestIntervalData[];
}

@Injectable()
export class WorkoutExerciseService {
  constructor(
    private readonly repository: WorkoutExerciseRepository,
    private readonly repSchemeService: RepSchemeService,
    private readonly restIntervalService: RestIntervalService,
  ) {}

  create(data: Partial<WorkoutExercise>) {
    return this.repository.create(data);
  }

  findById(id: number) {
    return this.repository.findById(id);
  }

  findAll() {
    return this.repository.findAll();
  }

  update(id: number, data: Partial<WorkoutExercise>) {
    return this.repository.update(id, data);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }

  async createWithRelationships(
    data: WorkoutExerciseCreateData,
  ): Promise<WorkoutExercise> {
    const { repSchemes, restIntervals, ...workoutExerciseData } = data;

    const workoutExercise = await this.create(workoutExerciseData);

    if (repSchemes && repSchemes.length > 0) {
      const repSchemesWithId = repSchemes.map((scheme) => ({
        workout_exercise_id: workoutExercise.id,
        sets: scheme.sets,
        min_reps: scheme.min_reps,
        max_reps: scheme.max_reps,
      }));

      await this.repSchemeService.bulkCreate(repSchemesWithId);
    }

    if (restIntervals && restIntervals.length > 0) {
      const restIntervalsWithId = restIntervals.map((interval) => ({
        workout_exercise_id: workoutExercise.id,
        interval_time: interval.interval_time,
        order: interval.order,
      }));

      await this.restIntervalService.bulkCreate(restIntervalsWithId);
    }

    return workoutExercise;
  }

  async findByWorkoutId(workoutId: number): Promise<WorkoutExercise[]> {
    return this.repository.findByWorkoutId(workoutId);
  }
}
