import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TrainingDayExercise } from './training-day-exercise.entity';
import { BaseEntity } from '../utils/base/base.entity';

@Entity('rest_intervals')
export class RestInterval extends BaseEntity {
  @ManyToOne(
    () => TrainingDayExercise,
    (tde: TrainingDayExercise) => tde.restIntervals,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'training_day_exercise_id' })
  trainingDayExercise: TrainingDayExercise;

  @Column({ length: 30 })
  intervalTime: string;

  @Column({ type: 'int' })
  order: number;
}
