import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { TrainingDayExercise } from './training-day-exercise.entity';

@Entity('rest_intervals')
export class RestInterval {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => TrainingDayExercise,
    (tde: TrainingDayExercise) => tde.restIntervals,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'training_day_exercise_id' })
  trainingDayExercise: TrainingDayExercise;

  @RelationId((restInterval: RestInterval) => restInterval.trainingDayExercise)
  trainingDayExerciseId: number;

  @Column({ length: 30 })
  interval_time: string;

  @Column({ type: 'int' })
  order: number;
}
