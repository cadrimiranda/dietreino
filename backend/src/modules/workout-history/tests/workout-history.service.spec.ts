import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WorkoutHistoryService } from '../workout-history.service';
import { WorkoutHistoryRepository } from '../workout-history.repository';
import { WorkoutHistory } from '../../../entities/workout-history.entity';
import { WorkoutHistoryExercise } from '../../../entities/workout-history-exercise.entity';
import { WorkoutHistoryExerciseSet } from '../../../entities/workout-history-exercise-set.entity';
import { CreateWorkoutHistoryInput } from '../dto/create-workout-history.input';

describe('WorkoutHistoryService', () => {
  let service: WorkoutHistoryService;
  let repository: jest.Mocked<WorkoutHistoryRepository>;
  let dataSource: jest.Mocked<DataSource>;
  let mockEntityManager: any;

  const mockWorkoutHistory: WorkoutHistory = {
    id: 'uuid-test-id',
    user: { id: 'user-uuid-test-id' } as any,
    workout: { id: 'workout-uuid-test-id' } as any,
    executedAt: new Date('2024-01-15T10:00:00Z'),
    workoutName: 'Treino A - Peito e Tríceps',
    trainingDayOrder: 1,
    trainingDayName: 'Segunda - Peito',
    notes: 'Treino pesado hoje',
    durationMinutes: 60,
    workoutHistoryExercises: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByWorkoutId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockEntityManager = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const mockDataSourceInstance = {
      transaction: jest.fn((callback) => callback(mockEntityManager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutHistoryService,
        {
          provide: WorkoutHistoryRepository,
          useValue: mockRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSourceInstance,
        },
      ],
    }).compile();

    service = module.get<WorkoutHistoryService>(WorkoutHistoryService);
    repository = module.get(WorkoutHistoryRepository);
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of workout histories', async () => {
      repository.findAll.mockResolvedValue([mockWorkoutHistory]);

      const result = await service.findAll();

      expect(result).toEqual([mockWorkoutHistory]);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return workout history when found', async () => {
      repository.findById.mockResolvedValue(mockWorkoutHistory);

      const result = await service.findById('1');

      expect(result).toEqual(mockWorkoutHistory);
      expect(repository.findById).toHaveBeenCalledWith('1');
    });

    it('should return null when not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('999');

      expect(result).toBeNull();
      expect(repository.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('findByUserId', () => {
    it('should return user workout histories', async () => {
      repository.findByUserId.mockResolvedValue([mockWorkoutHistory]);

      const result = await service.findByUserId('1');

      expect(result).toEqual([mockWorkoutHistory]);
      expect(repository.findByUserId).toHaveBeenCalledWith('1');
    });
  });

  describe('findByWorkoutId', () => {
    it('should return workout histories for specific workout', async () => {
      repository.findByWorkoutId.mockResolvedValue([mockWorkoutHistory]);

      const result = await service.findByWorkoutId('1');

      expect(result).toEqual([mockWorkoutHistory]);
      expect(repository.findByWorkoutId).toHaveBeenCalledWith('1');
    });
  });

  describe('create', () => {
    const createInput: CreateWorkoutHistoryInput = {
      userId: '1',
      workoutId: '1',
      executedAt: new Date('2024-01-15T10:00:00Z'),
      workoutName: 'Treino A - Peito e Tríceps',
      trainingDayOrder: 1,
      trainingDayName: 'Segunda - Peito',
      notes: 'Treino pesado hoje',
      durationMinutes: 60,
      exercises: [
        {
          exerciseId: '1',
          order: 1,
          exerciseName: 'Supino Reto',
          plannedSets: 3,
          completedSets: 3,
          notes: 'Boa execução',
          sets: [
            {
              setNumber: 1,
              weight: 80,
              reps: 12,
              plannedRepsMin: 10,
              plannedRepsMax: 12,
              restSeconds: 60,
              isCompleted: true,
              isFailure: false,
              notes: 'Primeira série boa',
              executedAt: new Date('2024-01-15T10:05:00Z'),
            },
          ],
        },
      ],
    };

    it('should create workout history with exercises and sets', async () => {
      const savedWorkoutHistory = { ...mockWorkoutHistory, id: 'uuid-test-id' };
      const savedExercise = {
        id: 'exercise-uuid-test-id',
        workoutHistory: savedWorkoutHistory,
      } as any;
      const savedSet = {
        id: 'set-uuid-test-id',
        workoutHistoryExercise: savedExercise,
      } as any;

      mockEntityManager.create
        .mockReturnValueOnce(savedWorkoutHistory)
        .mockReturnValueOnce(savedExercise)
        .mockReturnValueOnce(savedSet);

      mockEntityManager.save
        .mockResolvedValueOnce(savedWorkoutHistory)
        .mockResolvedValueOnce(savedExercise)
        .mockResolvedValueOnce(savedSet);

      mockEntityManager.findOne.mockResolvedValue({
        ...savedWorkoutHistory,
        workoutHistoryExercises: [
          {
            ...savedExercise,
            workoutHistoryExerciseSets: [savedSet],
          },
        ],
      });

      const result = await service.create(createInput);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockEntityManager.create).toHaveBeenCalledTimes(3);
      expect(mockEntityManager.save).toHaveBeenCalledTimes(3);
      expect(result).toBeDefined();
    });

    it('should handle transaction errors', async () => {
      const error = new Error('Transaction failed');
      dataSource.transaction.mockRejectedValue(error);

      await expect(service.create(createInput)).rejects.toThrow(
        'Transaction failed',
      );
    });
  });

  describe('update', () => {
    it('should update existing workout history', async () => {
      repository.findById.mockResolvedValue(mockWorkoutHistory);
      repository.update.mockResolvedValue({
        ...mockWorkoutHistory,
        notes: 'Updated notes',
      });

      const result = await service.update('1', { notes: 'Updated notes' });

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.update).toHaveBeenCalledWith('1', {
        notes: 'Updated notes',
      });
      expect(result?.notes).toBe('Updated notes');
    });

    it('should throw NotFoundException when workout history not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('999', { notes: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete existing workout history', async () => {
      repository.findById.mockResolvedValue(mockWorkoutHistory);
      repository.delete.mockResolvedValue(true);

      const result = await service.delete('1');

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when workout history not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('999')).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('toWorkoutHistoryType', () => {
    it('should convert entity to GraphQL type', () => {
      const workoutHistoryWithExercises = {
        ...mockWorkoutHistory,
        workoutHistoryExercises: [
          {
            id: 'exercise-uuid-test-id',
            workoutHistory: { id: 'uuid-test-id' },
            exercise: { id: 'exercise-uuid-test-id' },
            order: 1,
            exerciseName: 'Supino Reto',
            plannedSets: 3,
            completedSets: 3,
            notes: 'Boa execução',
            workoutHistoryExerciseSets: [
              {
                id: 'set-uuid-test-id',
                workoutHistoryExercise: { id: 'exercise-uuid-test-id' },
                setNumber: 1,
                weight: 80,
                reps: 12,
                plannedRepsMin: 10,
                plannedRepsMax: 12,
                restSeconds: 60,
                isCompleted: true,
                isFailure: false,
                notes: 'Primeira série boa',
                executedAt: new Date('2024-01-15T10:05:00Z'),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      } as WorkoutHistory;

      const result = service.toWorkoutHistoryType(workoutHistoryWithExercises);

      expect(result).toMatchObject({
        id: 'uuid-test-id',
        userId: 'user-uuid-test-id',
        workoutId: 'workout-uuid-test-id',
        executedAt: mockWorkoutHistory.executedAt,
        workoutName: 'Treino A - Peito e Tríceps',
        trainingDayOrder: 1,
        trainingDayName: 'Segunda - Peito',
        notes: 'Treino pesado hoje',
        durationMinutes: 60,
        workoutHistoryExercises: [
          {
            id: 'exercise-uuid-test-id',
            workoutHistoryId: 'uuid-test-id',
            exerciseId: 'exercise-uuid-test-id',
            order: 1,
            exerciseName: 'Supino Reto',
            plannedSets: 3,
            completedSets: 3,
            notes: 'Boa execução',
            workoutHistoryExerciseSets: [
              {
                id: 'set-uuid-test-id',
                workoutHistoryExerciseId: 'exercise-uuid-test-id',
                setNumber: 1,
                weight: 80,
                reps: 12,
                plannedRepsMin: 10,
                plannedRepsMax: 12,
                restSeconds: 60,
                isCompleted: true,
                isFailure: false,
                notes: 'Primeira série boa',
              },
            ],
          },
        ],
      });
    });
  });
});
