import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TrainingDayExercise } from './training-day-exercise.entity';
import { BaseEntity } from '../utils/base/base.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('rest_intervals')
export class RestInterval extends BaseEntity {
  @ManyToOne(
    () => TrainingDayExercise,
    (tde: TrainingDayExercise) => tde.restIntervals,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'training_day_exercise_id' })
  trainingDayExercise: TrainingDayExercise;

  @Field(() => String)
  @Column({ length: 30 })
  intervalTime: string;

  @Field(() => Number)
  @Column({ type: 'int' })
  order: number;
}
