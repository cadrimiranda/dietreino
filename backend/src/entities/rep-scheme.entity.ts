import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TrainingDayExercise } from './training-day-exercise.entity';
import { BaseEntity } from '../utils/base/base.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('rep_schemes')
export class RepScheme extends BaseEntity {
  @ManyToOne(
    () => TrainingDayExercise,
    (tde: TrainingDayExercise) => tde.repSchemes,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'training_day_exercise_id' })
  trainingDayExercise: TrainingDayExercise;

  @Field(() => Number)
  @Column({ type: 'int' })
  sets: number;

  @Field(() => Number)
  @Column({ type: 'int' })
  minReps: number;

  @Field(() => Number)
  @Column({ type: 'int' })
  maxReps: number;
}
