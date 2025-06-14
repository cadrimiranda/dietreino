import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { WorkoutHistory } from './workout-history.entity';
import { Exercise } from './exercise.entity';
import { WorkoutHistoryExerciseSet } from './workout-history-exercise-set.entity';
import { BaseEntity } from '../utils/base/base.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('workout_history_exercises')
export class WorkoutHistoryExercise extends BaseEntity {
  @Field(() => WorkoutHistory)
  @ManyToOne(
    () => WorkoutHistory,
    (workoutHistory) => workoutHistory.workoutHistoryExercises,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'workout_history_id' })
  workoutHistory: WorkoutHistory;

  @Field(() => Exercise)
  @ManyToOne(() => Exercise, { eager: true })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @Field(() => Number)
  @Column({ type: 'int' })
  order: number;

  @Field(() => String)
  @Column({ length: 100, name: 'exercise_name' })
  exerciseName: string;

  @Field(() => Number)
  @Column({ type: 'int', name: 'planned_sets' })
  plannedSets: number;

  @Field(() => Number)
  @Column({ type: 'int', name: 'completed_sets' })
  completedSets: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Field(() => [WorkoutHistoryExerciseSet])
  @OneToMany(
    () => WorkoutHistoryExerciseSet,
    (whes: WorkoutHistoryExerciseSet) => whes.workoutHistoryExercise,
    { eager: true },
  )
  workoutHistoryExerciseSets: WorkoutHistoryExerciseSet[];
}