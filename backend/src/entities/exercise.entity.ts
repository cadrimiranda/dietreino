import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TrainingDayExercise } from './training-day-exercise.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  muscle_group: string;

  @Column({ type: 'text', nullable: true })
  video_link: string;

  @OneToMany(
    () => TrainingDayExercise,
    (tde: TrainingDayExercise) => tde.exercise,
  )
  trainingDayExercises: TrainingDayExercise[];
}
