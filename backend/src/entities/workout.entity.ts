import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { TrainingDay } from './training-day.entity';
import { BaseEntity } from '../utils/base/base.entity';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
@Entity('workout')
export class Workout extends BaseEntity {
  @Field(() => User)
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field()
  @Column({ type: 'timestamp with time zone' })
  week_start: Date;

  @Field()
  @Column({ type: 'timestamp with time zone' })
  week_end: Date;

  @Field()
  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Field()
  @Column({ type: 'int', default: 0, name: 'training_days_bitfield' })
  trainingDaysBitfield: number;

  @Field({ nullable: true })
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'started_at',
  })
  startedAt: Date;

  @Field(() => [TrainingDay])
  @OneToMany(() => TrainingDay, (td: TrainingDay) => td.workout, {
    eager: true,
  })
  trainingDays: TrainingDay[];
}
