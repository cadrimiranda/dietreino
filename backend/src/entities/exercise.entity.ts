import { Entity, Column, OneToMany } from 'typeorm';
import { TrainingDayExercise } from './training-day-exercise.entity';
import { BaseEntity } from '../utils/base/base.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('exercises')
export class Exercise extends BaseEntity {
  @Field(() => String)
  @Column({ length: 100 })
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  videoLink: string;

  @OneToMany(
    () => TrainingDayExercise,
    (tde: TrainingDayExercise) => tde.exercise,
  )
  trainingDayExercises: TrainingDayExercise[];
}
