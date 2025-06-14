import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { WorkoutHistoryExercise } from './workout-history-exercise.entity';
import { BaseEntity } from '../utils/base/base.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('workout_history_exercise_sets')
export class WorkoutHistoryExerciseSet extends BaseEntity {
  @Field(() => WorkoutHistoryExercise)
  @ManyToOne(
    () => WorkoutHistoryExercise,
    (workoutHistoryExercise) =>
      workoutHistoryExercise.workoutHistoryExerciseSets,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'workout_history_exercise_id' })
  workoutHistoryExercise: WorkoutHistoryExercise;

  @Field(() => Number)
  @Column({ type: 'int', name: 'set_number' })
  setNumber: number;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight: number;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'int', nullable: true })
  reps: number;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'int', nullable: true, name: 'planned_reps_min' })
  plannedRepsMin: number;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'int', nullable: true, name: 'planned_reps_max' })
  plannedRepsMax: number;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'int', nullable: true, name: 'rest_seconds' })
  restSeconds: number;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false, name: 'is_completed' })
  isCompleted: boolean;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false, name: 'is_failure' })
  isFailure: boolean;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Field(() => Date, { nullable: true })
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'executed_at',
  })
  executedAt: Date;
}
