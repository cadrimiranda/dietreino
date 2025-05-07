import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TrainingDay } from './training-day.entity';
import { Exercise } from './exercise.entity';
import { WeeklyLoad } from './weekly-load.entity';
import { RepScheme } from './rep-scheme.entity';
import { RestInterval } from './rest-interval.entity';
import { BaseEntity } from '../utils/base/base.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
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

  @Field(() => Exercise)
  @ManyToOne(() => Exercise, (exercise) => exercise.trainingDayExercises, {
    eager: true,
  })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @Field(() => Number)
  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'int' })
  sets: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => WeeklyLoad, (wl: WeeklyLoad) => wl.trainingDayExercise, {
    eager: true,
  })
  weeklyLoads: WeeklyLoad[];

  @Field(() => [RepScheme])
  @OneToMany(() => RepScheme, (rs: RepScheme) => rs.trainingDayExercise, {
    eager: true,
  })
  repSchemes: RepScheme[];

  @Field(() => [RestInterval])
  @OneToMany(() => RestInterval, (ri: RestInterval) => ri.trainingDayExercise, {
    eager: true,
  })
  restIntervals: RestInterval[];
}
