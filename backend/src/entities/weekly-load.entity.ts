import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { TrainingDayExercise } from './training-day-exercise.entity';
import { BaseEntity } from '../utils/base/base.entity';

@Entity('weekly_loads')
export class WeeklyLoad extends BaseEntity {
  @ManyToOne(
    () => TrainingDayExercise,
    (tde: TrainingDayExercise) => tde.weeklyLoads,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'training_day_exercise_id' })
  trainingDayExercise: TrainingDayExercise;

  @Column({ type: 'int' })
  week: number;

  @Column({ length: 100 })
  load: string;
}
