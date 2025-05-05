import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { Workout } from './workout.entity';
import { Exercise } from './exercise.entity';
import { WeeklyLoad } from './weekly-load.entity';
import { RepScheme } from './rep-scheme.entity';
import { RestInterval } from './rest-interval.entity';

@Entity('workout_exercises')
export class WorkoutExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Workout, (workout) => workout.workoutExercises, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn()
  workout: Workout;

  @RelationId((workoutExercise: WorkoutExercise) => workoutExercise.workout)
  workoutId: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.workoutExercises, {
    eager: false,
  })
  @JoinColumn()
  exercise: Exercise;

  @RelationId((workoutExercise: WorkoutExercise) => workoutExercise.exercise)
  exerciseId: number;

  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'int' })
  sets: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => WeeklyLoad, (wl: WeeklyLoad) => wl.workoutExercise)
  weeklyLoads: WeeklyLoad[];

  @OneToMany(() => RepScheme, (rs: RepScheme) => rs.workoutExercise)
  repSchemes: RepScheme[];

  @OneToMany(() => RestInterval, (ri: RestInterval) => ri.workoutExercise)
  restIntervals: RestInterval[];
}
