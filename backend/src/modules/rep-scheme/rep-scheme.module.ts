import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepScheme } from '../../entities/rep-scheme.entity';
import { RepSchemeService } from './rep-scheme.service';
import { RepSchemeRepository } from './rep-scheme.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RepScheme])],
  providers: [RepSchemeService, RepSchemeRepository],
  exports: [RepSchemeService],
})
export class RepSchemeModule {}
