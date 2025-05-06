import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Workout } from './workout.entity';
import { TrainingDayExercise } from './training-day-exercise.entity';
import { BaseEntity } from '../utils/base/base.entity';

@Entity('training_days')
export class TrainingDay extends BaseEntity {
  @Column()
  workout_id: number;

  @ManyToOne(() => Workout, (workout: Workout) => workout.trainingDays, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workout_id' })
  workout: Workout;

  @Column({ type: 'int' })
  dayOfWeek: number;

  @Column({ type: 'text', nullable: true })
  focus: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'int' })
  order: number;

  @OneToMany(
    () => TrainingDayExercise,
    (tde: TrainingDayExercise) => tde.trainingDay,
  )
  trainingDayExercises: TrainingDayExercise[];
}
