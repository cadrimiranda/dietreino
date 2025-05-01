import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestInterval } from '../../entities/rest-interval.entity';
import { RestIntervalService } from './rest-interval.service';
import { RestIntervalRepository } from './rest-interval.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RestInterval])],
  providers: [RestIntervalService, RestIntervalRepository],
  exports: [RestIntervalService],
})
export class RestIntervalModule {}
