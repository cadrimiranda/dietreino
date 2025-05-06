import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TrainingDay } from './training-day.entity';
import { Exercise } from './exercise.entity';
import { WeeklyLoad } from './weekly-load.entity';
import { RepScheme } from './rep-scheme.entity';
import { RestInterval } from './rest-interval.entity';
import { BaseEntity } from '../utils/base/base.entity';

@Entity('training_day_exercises')
export class TrainingDayExercise extends BaseEntity {
  @ManyToOne(
    () => TrainingDay,
    (trainingDay) => trainingDay.trainingDayExercises,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'training_day_id' })
  trainingDay: TrainingDay;

  @ManyToOne(() => Exercise, (exercise) => exercise.trainingDayExercises, {
    eager: false,
  })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'int' })
  sets: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => WeeklyLoad, (wl: WeeklyLoad) => wl.trainingDayExercise)
  weeklyLoads: WeeklyLoad[];

  @OneToMany(() => RepScheme, (rs: RepScheme) => rs.trainingDayExercise)
  repSchemes: RepScheme[];

  @OneToMany(() => RestInterval, (ri: RestInterval) => ri.trainingDayExercise)
  restIntervals: RestInterval[];
}
