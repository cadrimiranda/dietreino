import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Workout } from './workout.entity';
import { TrainingDayExercise } from './training-day-exercise.entity';

@Entity('training_days')
export class TrainingDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  workout_id: number;

  @ManyToOne(() => Workout, (workout: Workout) => workout.trainingDays, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workout_id' })
  workout: Workout;

  @Column({ type: 'int' })
  day_of_week: number;

  @Column({ type: 'text', nullable: true })
  focus: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'int' })
  order: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    () => TrainingDayExercise,
    (tde: TrainingDayExercise) => tde.trainingDay,
  )
  trainingDayExercises: TrainingDayExercise[];
}
