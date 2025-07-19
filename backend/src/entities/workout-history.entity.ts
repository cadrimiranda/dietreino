import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Workout } from './workout.entity';
import { WorkoutHistoryExercise } from './workout-history-exercise.entity';
import { BaseEntity } from '../utils/base/base.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('workout_history')
export class WorkoutHistory extends BaseEntity {
  @Field(() => User)
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => Workout)
  @ManyToOne(() => Workout, { eager: true })
  @JoinColumn({ name: 'workout_id' })
  workout: Workout;

  @Field(() => Date)
  @Column({ type: 'timestamp with time zone', name: 'executed_at' })
  executedAt: Date;

  @Field(() => String)
  @Column({ length: 100, name: 'workout_name' })
  workoutName: string;

  @Field(() => Number)
  @Column({ type: 'int', name: 'training_day_order' })
  trainingDayOrder: number;

  @Field(() => String)
  @Column({ length: 100, name: 'training_day_name' })
  trainingDayName: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'int', nullable: true, name: 'duration_minutes' })
  durationMinutes: number;

  @Field(() => [WorkoutHistoryExercise])
  @OneToMany(
    () => WorkoutHistoryExercise,
    (whe: WorkoutHistoryExercise) => whe.workoutHistory,
    { eager: true },
  )
  workoutHistoryExercises: WorkoutHistoryExercise[];
}
