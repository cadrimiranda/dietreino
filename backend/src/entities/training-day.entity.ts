import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Workout } from './workout.entity';
import { TrainingDayExercise } from './training-day-exercise.entity';
import { BaseEntity } from '../utils/base/base.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('training_days')
export class TrainingDay extends BaseEntity {
  @Column()
  workout_id: number;

  @ManyToOne(() => Workout, (workout: Workout) => workout.trainingDays, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workout_id' })
  workout: Workout;

  @Field(() => Number)
  @Column({ type: 'int' })
  dayOfWeek: number;

  @Column({ type: 'text', nullable: true })
  focus: string;

  @Field(() => String)
  @Column({ length: 100 })
  name: string;

  @Field(() => Number)
  @Column({ type: 'int' })
  order: number;

  @Field(() => [TrainingDayExercise])
  @OneToMany(
    () => TrainingDayExercise,
    (tde: TrainingDayExercise) => tde.trainingDay,
    { eager: true },
  )
  trainingDayExercises: TrainingDayExercise[];
}
