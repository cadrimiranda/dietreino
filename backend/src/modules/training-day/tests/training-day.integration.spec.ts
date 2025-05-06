import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { TrainingDay, Workout } from '@/entities';
import { Repository } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

import { CreateTrainingDayInput } from '@/modules/training-day/dto/training-day-create.input';
import { UpdateTrainingDayInput } from '@/modules/training-day/dto/training-day-update.input';
import { TrainingDayRepository } from '@/modules/training-day/training-day.repository';
import { TrainingDayResolver } from '@/modules/training-day/training-day.resolver';
import { TrainingDayService } from '@/modules/training-day/training-day.service';
import { WorkoutModule } from '@/modules/workout/workout.module';

describe.skip('TrainingDay Integration Tests', () => {
  let app: INestApplication;
  let service: TrainingDayService;
  let resolver: TrainingDayResolver;
  let repository: TrainingDayRepository;
  let typeOrmRepo: Repository<TrainingDay>;
  let container: StartedPostgreSqlContainer;

  // Test data
  const sampleTrainingDay: CreateTrainingDayInput = {
    workoutId: 1,
    dayOfWeek: 2,
    focus: 'Strength',
    name: 'Push Day',
    order: 1,
  };

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_password')
      .start();

    // Create testing module with real implementations
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: container.getHost(),
          port: container.getPort(),
          username: container.getUsername(),
          password: container.getPassword(),
          database: container.getDatabase(),
          entities: [TrainingDay, Workout],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([TrainingDay]),
        WorkoutModule,
      ],
      providers: [
        TrainingDayService,
        TrainingDayRepository,
        TrainingDayResolver,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = moduleFixture.get<TrainingDayService>(TrainingDayService);
    resolver = moduleFixture.get<TrainingDayResolver>(TrainingDayResolver);
    repository = moduleFixture.get<TrainingDayRepository>(
      TrainingDayRepository,
    );
    typeOrmRepo = moduleFixture.get<Repository<TrainingDay>>(
      getRepositoryToken(TrainingDay),
    );

    // Clear database before tests
    await typeOrmRepo.clear();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clear database after each test
    await typeOrmRepo.clear();
    await container.stop();
  });

  describe('Create-Read-Update-Delete flow', () => {
    it('should create, read, update and delete a training day', async () => {
      // CREATE
      const created = await resolver.create(sampleTrainingDay);
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.workout.id).toEqual(sampleTrainingDay.workoutId);
      expect(created.workout_id).toEqual(sampleTrainingDay.workoutId);
      expect(created.name).toEqual(sampleTrainingDay.name);
      expect(created.createdAt).toBeDefined();
      expect(created.updatedAt).toBeDefined();

      const createdId = created.id;

      // CREATE SECOND ITEM
      const secondItem: CreateTrainingDayInput = {
        workoutId: 1,
        dayOfWeek: 4,
        focus: 'Hypertrophy',
        name: 'Pull Day',
        order: 2,
      };
      await resolver.create(secondItem);

      // CREATE THIRD ITEM with different workoutId
      const thirdItem: CreateTrainingDayInput = {
        workoutId: 2,
        dayOfWeek: 1,
        focus: 'Cardio',
        name: 'Cardio Day',
        order: 1,
      };
      await resolver.create(thirdItem);

      // READ ALL
      const allItems = await resolver.findAll();
      expect(allItems).toHaveLength(3);

      // READ ONE
      const readItem = await resolver.findOne(createdId);
      expect(readItem).toBeDefined();
      expect(readItem.id).toEqual(createdId);
      expect(readItem.name).toEqual(sampleTrainingDay.name);

      // READ BY WORKOUT
      const workoutItems = await resolver.findByWorkoutId(1);
      expect(workoutItems).toHaveLength(2);
      expect(workoutItems[0].order).toBeLessThan(workoutItems[1].order);

      const workout2Items = await resolver.findByWorkoutId(2);
      expect(workout2Items).toHaveLength(1);
      expect(workout2Items[0].name).toEqual('Cardio Day');

      // UPDATE
      const updateData: UpdateTrainingDayInput = {
        focus: 'Strength & Power',
        name: 'Updated Push Day',
      };

      const updated = await resolver.update(createdId, updateData);
      expect(updated).toBeDefined();
      expect(updated.id).toEqual(createdId);
      expect(updated.focus).toEqual(updateData.focus);
      expect(updated.name).toEqual(updateData.name);
      expect(updated.workout.id).toEqual(sampleTrainingDay.workoutId);
      expect(updated.workout_id).toEqual(sampleTrainingDay.workoutId);
      expect(updated.updatedAt).not.toEqual(created.updatedAt);

      // READ AFTER UPDATE
      const readAfterUpdate = await resolver.findOne(createdId);
      expect(readAfterUpdate.name).toEqual(updateData.name);
      expect(readAfterUpdate.focus).toEqual(updateData.focus);

      // DELETE
      const deleted = await resolver.remove(createdId);
      expect(deleted).toBe(true);

      // VERIFY DELETION
      try {
        await resolver.findOne(createdId);
        fail('Should throw an error when trying to find a deleted entity');
      } catch (error) {
        expect(error).toBeDefined();
      }

      // VERIFY REMAINING ITEMS
      const remainingItems = await resolver.findAll();
      expect(remainingItems).toHaveLength(2);
    });
  });

  describe('Upsert operation', () => {
    it('should create a new item when upserting without id', async () => {
      const upsertData: CreateTrainingDayInput = {
        workoutId: 3,
        dayOfWeek: 3,
        focus: 'Recovery',
        name: 'Active Recovery',
        order: 1,
      };

      const upserted = await resolver.upsert(upsertData);
      expect(upserted).toBeDefined();
      expect(upserted.id).toBeDefined();
      expect(upserted.workout.id).toEqual(sampleTrainingDay.workoutId);
      expect(upserted.workout_id).toEqual(sampleTrainingDay.workoutId);

      // Verify item was created
      const allItems = await resolver.findAll();
      expect(allItems).toHaveLength(1);
    });

    it('should update an existing item when upserting with id', async () => {
      // First create an item
      const created = await resolver.create(sampleTrainingDay);
      const createdId = created.id;

      // Prepare upsert data with the existing id
      const upsertData = {
        id: createdId,
        workoutId: 1,
        dayOfWeek: 2,
        focus: 'Modified Focus',
        name: 'Modified Name',
        order: 3,
      };

      // Perform upsert
      const upserted = await service.upsert(upsertData);
      expect(upserted).toBeDefined();
      expect(upserted.id).toEqual(createdId);
      expect(upserted.focus).toEqual(upsertData.focus);
      expect(upserted.name).toEqual(upsertData.name);
      expect(upserted.order).toEqual(upsertData.order);

      // Verify only one item exists
      const allItems = await resolver.findAll();
      expect(allItems).toHaveLength(1);
    });
  });

  describe('Error handling', () => {
    it('should handle not found errors gracefully', async () => {
      try {
        await resolver.findOne('non-existent-id');
        fail('Should throw an error when trying to find a non-existent entity');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle validation errors when creating training days', async () => {
      // Create a TypeORM repository spy to simulate validation errors
      jest
        .spyOn(typeOrmRepo, 'save')
        .mockRejectedValueOnce(new Error('Validation failed'));

      try {
        await service.create({
          workoutId: 1,
          dayOfWeek: 1,
          name: 'Invalid Day',
          order: 1,
        } as any); // Missing required fields to trigger validation error

        fail('Should throw an error when validation fails');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Service-Repository interaction', () => {
    it('should correctly pass parameters from service to repository', async () => {
      // Create spies on repository methods
      const findAllSpy = jest.spyOn(repository, 'findAll');
      const findByIdSpy = jest.spyOn(repository, 'findById');
      const findByWorkoutIdSpy = jest.spyOn(repository, 'findByWorkoutId');
      const createSpy = jest.spyOn(repository, 'create');
      const updateSpy = jest.spyOn(repository, 'update');
      const removeSpy = jest.spyOn(repository, 'remove');

      // Create a test training day
      const created = await service.create(sampleTrainingDay);
      const trainingDayId = created.id;

      // Test service method calls
      await service.findAll();
      expect(findAllSpy).toHaveBeenCalled();

      await service.findById(trainingDayId);
      expect(findByIdSpy).toHaveBeenCalledWith(trainingDayId);

      await service.findByWorkoutId(1);
      expect(findByWorkoutIdSpy).toHaveBeenCalledWith(1);

      const updateData = { name: 'Updated Name' };
      await service.update(trainingDayId, updateData);
      expect(updateSpy).toHaveBeenCalledWith(trainingDayId, updateData);

      await service.remove(trainingDayId);
      expect(removeSpy).toHaveBeenCalledWith(trainingDayId);

      // Reset spies
      jest.clearAllMocks();
    });
  });

  describe('Resolver-Service interaction', () => {
    it('should correctly pass parameters from resolver to service', async () => {
      // Create spies on service methods
      const findAllSpy = jest.spyOn(service, 'findAll');
      const findByIdSpy = jest.spyOn(service, 'findById');
      const findByWorkoutIdSpy = jest.spyOn(service, 'findByWorkoutId');
      const createSpy = jest.spyOn(service, 'create');
      const updateSpy = jest.spyOn(service, 'update');
      const upsertSpy = jest.spyOn(service, 'upsert');
      const removeSpy = jest.spyOn(service, 'remove');

      // Create a test training day
      const created = await resolver.create(sampleTrainingDay);
      const trainingDayId = created.id;

      // Test resolver method calls
      await resolver.findAll();
      expect(findAllSpy).toHaveBeenCalled();

      await resolver.findOne(trainingDayId);
      expect(findByIdSpy).toHaveBeenCalledWith(trainingDayId);

      await resolver.findByWorkoutId(1);
      expect(findByWorkoutIdSpy).toHaveBeenCalledWith(1);

      const updateData = { name: 'Updated Through Resolver' };
      await resolver.update(trainingDayId, updateData);
      expect(updateSpy).toHaveBeenCalledWith(trainingDayId, updateData);

      await resolver.upsert(sampleTrainingDay);
      expect(upsertSpy).toHaveBeenCalledWith(sampleTrainingDay);

      await resolver.remove(trainingDayId);
      expect(removeSpy).toHaveBeenCalledWith(trainingDayId);

      // Reset spies
      jest.clearAllMocks();
    });
  });
});
