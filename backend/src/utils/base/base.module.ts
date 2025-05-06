import { DynamicModule, Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseEntity } from './base.entity';

export interface BaseModuleOptions<T extends BaseEntity> {
  entity: Type<T>;
  repository: Type<any>;
  service: Type<any>;
  resolver: Type<any>;
}

export class BaseModule {
  static forFeature<T extends BaseEntity>(
    options: BaseModuleOptions<T>,
  ): DynamicModule {
    const { entity, repository, service, resolver } = options;

    return {
      module: BaseModule,
      imports: [TypeOrmModule.forFeature([entity])],
      providers: [repository, service, resolver],
      exports: [repository, service],
    };
  }
}
