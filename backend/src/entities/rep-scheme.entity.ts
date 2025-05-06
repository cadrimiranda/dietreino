import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { TrainingDayExercise } from './training-day-exercise.entity';

@Entity('rep_schemes')
export class RepScheme {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => TrainingDayExercise,
    (tde: TrainingDayExercise) => tde.repSchemes,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'training_day_exercise_id' })
  trainingDayExercise: TrainingDayExercise;

  @RelationId((repScheme: RepScheme) => repScheme.trainingDayExercise)
  trainingDayExerciseId: number;

  @Column({ type: 'int' })
  sets: number;

  @Column({ type: 'int' })
  min_reps: number;

  @Column({ type: 'int' })
  max_reps: number;
}
