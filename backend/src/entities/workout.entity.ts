import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { User } from './user.entity';
import { TrainingDay } from './training-day.entity';
import { Stretch } from './stretch.entity';

@Entity('workout')
export class Workout {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((workout: Workout) => workout.user)
  user_id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'timestamp with time zone' })
  week_start: Date;

  @Column({ type: 'timestamp with time zone' })
  week_end: Date;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  created_at: Date;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Column({ type: 'int', default: 0, name: 'training_days_bitfield' })
  trainingDaysBitfield: number;

  @OneToMany(() => TrainingDay, (td: TrainingDay) => td.workout)
  trainingDays: TrainingDay[];

  @OneToMany(() => Stretch, (stretch: Stretch) => stretch.workout)
  stretches: Stretch[];
}
