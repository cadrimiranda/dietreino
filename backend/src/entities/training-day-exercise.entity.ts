import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { TrainingDay } from './training-day.entity';
import { Exercise } from './exercise.entity';
import { WeeklyLoad } from './weekly-load.entity';
import { RepScheme } from './rep-scheme.entity';
import { RestInterval } from './rest-interval.entity';

@Entity('training_day_exercises')
export class TrainingDayExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => TrainingDay,
    (trainingDay) => trainingDay.trainingDayExercises,
    {
      onDelete: 'CASCADE',
      eager: false,
    },
  )
  @JoinColumn({ name: 'training_day_id' })
  trainingDay: TrainingDay;

  @RelationId(
    (trainingDayExercise: TrainingDayExercise) =>
      trainingDayExercise.trainingDay,
  )
  trainingDayId: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.trainingDayExercises, {
    eager: false,
  })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @RelationId(
    (trainingDayExercise: TrainingDayExercise) => trainingDayExercise.exercise,
  )
  exerciseId: number;

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
