import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { TrainingDayExercise } from './training-day-exercise.entity';

@Entity('weekly_loads')
export class WeeklyLoad {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => TrainingDayExercise,
    (tde: TrainingDayExercise) => tde.weeklyLoads,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'training_day_exercise_id' })
  trainingDayExercise: TrainingDayExercise;

  @RelationId((weeklyLoad: WeeklyLoad) => weeklyLoad.trainingDayExercise)
  trainingDayExerciseId: number;

  @Column({ type: 'int' })
  week: number;

  @Column({ length: 100 })
  load: string;
}
