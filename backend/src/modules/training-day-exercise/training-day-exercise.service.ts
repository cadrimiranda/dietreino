import { Injectable } from '@nestjs/common';
import { TrainingDayExerciseRepository } from './training-day-exercise.repository';
import { TrainingDayExercise } from '@/entities';
import { BaseService } from '@/utils/base/base.service';
import { RepSchemeService } from '../rep-scheme/rep-scheme.service';
import { RestIntervalService } from '../rest-interval/rest-interval.service';
import { ExerciseService } from '../exercise/exercise.service';
import { RepSchemeUpsertDto } from '../rep-scheme/dto/repSchemeUpsert';
import { RestIntervalUpsertDto } from '../rest-interval/dto/restIntervalUpsert';

interface RepSchemeData {
  sets: number;
  min_reps: number;
  max_reps: number;
}

interface RestIntervalData {
  interval_time: string;
  order: number;
}

export interface WorkoutExerciseCreateData {
  exerciseName: string;
  trainingDayId: string;
  repSchemes: RepSchemeData[];
  restIntervals: RestIntervalData[];
}

@Injectable()
export class TrainingDayExerciseService extends BaseService<TrainingDayExercise> {
  constructor(
    private readonly trainingDayExerciseRepository: TrainingDayExerciseRepository,
    private readonly exerciseService: ExerciseService,
    private readonly repSchemaService: RepSchemeService,
    private readonly restIntervalService: RestIntervalService,
  ) {
    super(trainingDayExerciseRepository);
  }

  async createBatchByTrainingDay(input: WorkoutExerciseCreateData[]) {
    const createdExercises: TrainingDayExercise[] = [];

    for (const data in input) {
      const { exerciseName, trainingDayId, repSchemes, restIntervals } =
        input[data];

      let exercise = await this.exerciseService.findByName(exerciseName);

      if (!exercise) {
        exercise = await this.exerciseService.create({
          name: exerciseName,
        });
      }
      
      const trainingDayExercise =
        await this.trainingDayExerciseRepository.create({
          trainingDay: { id: trainingDayId },
          exercise: { id: exercise.id },
          order: createdExercises.length + 1,
        });

      if (repSchemes.length > 0) {
        const repSchemesData: RepSchemeUpsertDto[] = repSchemes.map(
          (scheme) => ({
            trainingDayExerciseId: trainingDayExercise.id,
            sets: scheme.sets,
            minReps: scheme.min_reps,
            maxReps: scheme.max_reps,
          }),
        );

        await this.repSchemaService.bulkUpsert(repSchemesData);
      }

      if (restIntervals.length > 0) {
        const restIntervalsData: RestIntervalUpsertDto[] = restIntervals.map(
          (interval, index) => ({
            trainingDayExerciseId: trainingDayExercise.id,
            intervalTime: interval.interval_time,
            order: interval.order || index + 1,
          }),
        );

        await this.restIntervalService.bulkCreate(restIntervalsData);
      }

      createdExercises.push(trainingDayExercise);
    }

    return createdExercises;
  }
}
