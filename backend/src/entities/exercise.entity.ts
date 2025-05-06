import { Entity, Column, OneToMany } from 'typeorm';
import { TrainingDayExercise } from './training-day-exercise.entity';
import { BaseEntity } from '@/utils/base/base.entity';

@Entity('exercises')
export class Exercise extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  videoLink: string;

  @OneToMany(
    () => TrainingDayExercise,
    (tde: TrainingDayExercise) => tde.exercise,
  )
  trainingDayExercises: TrainingDayExercise[];
}
