import { Type } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BaseEntity } from './base.entity';
import { BaseService } from './base.service';

export interface BaseResolverInterface<T extends BaseEntity> {
  findAll(): Promise<T[]>;
  findOne(id: string): Promise<T>;
  create(input: any): Promise<T>;
  update(id: string, input: any): Promise<T>;
  upsert(input: any): Promise<T>;
  remove(id: string): Promise<boolean>;
}

export function BaseResolverFactory<
  T extends BaseEntity,
  CreateInput,
  UpdateInput,
>(
  EntityRef: Type<T>,
  CreateInputRef: Type<CreateInput>,
  UpdateInputRef: Type<UpdateInput>,
) {
  @Resolver({ isAbstract: true })
  abstract class BaseResolverHost implements BaseResolverInterface<T> {
    constructor(readonly baseService: BaseService<T>) {}

    @Query(() => [EntityRef], { name: `findAll${EntityRef.name}` })
    async findAll(): Promise<T[]> {
      return this.baseService.findAll();
    }

    @Query(() => EntityRef, { name: `findOne${EntityRef.name}` })
    async findOne(@Args('id', { type: () => ID }) id: string): Promise<T> {
      return this.baseService.findById(id);
    }

    @Mutation(() => EntityRef, { name: `create${EntityRef.name}` })
    async create(@Args('input') input: CreateInput): Promise<T> {
      return this.baseService.create(input as any);
    }

    @Mutation(() => EntityRef, { name: `update${EntityRef.name}` })
    async update(
      @Args('id', { type: () => ID }) id: string,
      @Args('input') input: UpdateInput,
    ): Promise<T> {
      return this.baseService.update(id, input as any);
    }

    @Mutation(() => EntityRef, { name: `upsert${EntityRef.name}` })
    async upsert(@Args('input') input: CreateInput): Promise<T> {
      return this.baseService.upsert(input as any);
    }

    @Mutation(() => Boolean, { name: `remove${EntityRef.name}` })
    async remove(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
      return this.baseService.remove(id);
    }
  }

  return BaseResolverHost;
}
