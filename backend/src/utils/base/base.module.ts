// base.module.ts (modificado)
import { DynamicModule, Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseEntity } from './base.entity';

export interface BaseModuleOptions<T extends BaseEntity> {
  entity: Type<T>;
  repository: Type<any>;
  service: Type<any>;
  resolver: Type<any>;
  imports?: any[]; // Adiciona imports opcionais
  providers?: Type<any>[]; // Adiciona providers opcionais
  exports?: Type<any>[]; // Adiciona exports opcionais
}

export class BaseModule {
  static forFeature<T extends BaseEntity>(
    options: BaseModuleOptions<T>,
  ): DynamicModule {
    const {
      entity,
      repository,
      service,
      resolver,
      imports = [],
      providers = [],
      exports = [],
    } = options;

    return {
      module: BaseModule,
      imports: [TypeOrmModule.forFeature([entity]), ...imports],
      providers: [repository, service, resolver, ...providers],
      exports: [repository, service, ...exports],
    };
  }
}
