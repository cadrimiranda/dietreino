import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TrainingDayExercise } from './training-day-exercise.entity';
import { BaseEntity } from '../utils/base/base.entity';

@Entity('rep_schemes')
export class RepScheme extends BaseEntity {
  @ManyToOne(
    () => TrainingDayExercise,
    (tde: TrainingDayExercise) => tde.repSchemes,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'training_day_exercise_id' })
  trainingDayExercise: TrainingDayExercise;

  @Column({ type: 'int' })
  sets: number;

  @Column({ type: 'int' })
  minReps: number;

  @Column({ type: 'int' })
  maxReps: number;
}
