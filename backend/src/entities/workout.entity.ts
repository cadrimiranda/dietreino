import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { TrainingDay } from './training-day.entity';
import { BaseEntity } from '../utils/base/base.entity';

@Entity('workout')
export class Workout extends BaseEntity {
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'timestamp with time zone' })
  week_start: Date;

  @Column({ type: 'timestamp with time zone' })
  week_end: Date;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Column({ type: 'int', default: 0, name: 'training_days_bitfield' })
  trainingDaysBitfield: number;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'started_at',
  })
  startedAt: Date;

  @OneToMany(() => TrainingDay, (td: TrainingDay) => td.workout, {
    eager: true,
  })
  trainingDays: TrainingDay[];
}
