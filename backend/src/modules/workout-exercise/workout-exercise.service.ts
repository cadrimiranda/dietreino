import { Injectable } from '@nestjs/common';
import { WorkoutExerciseRepository } from './workout-exercise.repository';
import { WorkoutExercise } from '../../entities/workout-exercise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepScheme } from '../../entities/rep-scheme.entity';
import { RestInterval } from '../../entities/rest-interval.entity';

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
    @InjectRepository(RepScheme)
    private readonly repSchemeRepository: Repository<RepScheme>,
    @InjectRepository(RestInterval)
    private readonly restIntervalRepository: Repository<RestInterval>,
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
    // 1. Extrair os dados para relações
    const { repSchemes, restIntervals, ...workoutExerciseData } = data;

    // 2. Criar o workout_exercise
    const workoutExercise = await this.create(workoutExerciseData);

    // 3. Criar os rep_schemes
    if (repSchemes && repSchemes.length > 0) {
      for (const schemeData of repSchemes) {
        await this.repSchemeRepository.save({
          workout_exercise_id: workoutExercise.id,
          ...schemeData,
        });
      }
    }

    // 4. Criar os rest_intervals
    if (restIntervals && restIntervals.length > 0) {
      for (const intervalData of restIntervals) {
        await this.restIntervalRepository.save({
          workout_exercise_id: workoutExercise.id,
          ...intervalData,
        });
      }
    }

    return workoutExercise;
  }
}
