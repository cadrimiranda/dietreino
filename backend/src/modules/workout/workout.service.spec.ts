import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutService } from './workout.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateWorkoutExercisesInput } from './dto/update-workout-exercises.input';

describe('WorkoutService - updateWorkoutExercises', () => {
  let service: WorkoutService;
  let mockRepository: any;
  let mockTrainingDayService: any;
  let mockTrainingDayExerciseService: any;
  let mockXlsxService: any;
  let mockExerciseService: any;
  let mockDataSource: any;
  let mockEntityManager: any;

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
    };

    mockTrainingDayService = {
      create: jest.fn(),
    };

    mockTrainingDayExerciseService = {
      createBatchByTrainingDay: jest.fn(),
    };

    mockXlsxService = {};

    mockExerciseService = {
      findById: jest.fn(),
    };

    mockEntityManager = {
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn(callback => callback(mockEntityManager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: WorkoutService,
          useFactory: () => {
            const service = new WorkoutService(
              mockRepository,
              mockTrainingDayService,
              mockTrainingDayExerciseService,
              mockXlsxService,
              mockExerciseService,
              mockDataSource,
            );
            return service;
          },
        },
      ],
    }).compile();

    service = module.get<WorkoutService>(WorkoutService);
  });

  describe('sets calculation', () => {
    it('should calculate total sets correctly when updating exercises', async () => {
      // Mock workout
      const mockWorkout = {
        id: '1',
        name: 'Test Workout',
        startedAt: null,
        trainingDays: [{ id: 'td1' }],
      };

      // Mock exercise
      const mockExercise = {
        id: 'ex1',
        name: 'Bench Press',
      };

      // Input with multiple rep schemes
      const input: UpdateWorkoutExercisesInput = {
        workoutId: '1',
        trainingDays: [
          {
            name: 'Day 1',
            order: 0,
            dayOfWeek: 0,
            exercises: [
              {
                exerciseId: 'ex1',
                order: 0,
                repSchemes: [
                  { sets: 2, minReps: 10, maxReps: 12 },
                  { sets: 2, minReps: 8, maxReps: 10 },
                  { sets: 1, minReps: 6, maxReps: 8 },
                ],
                restIntervals: [{ intervalTime: '90s', order: 0 }],
              },
            ],
          },
        ],
      };

      mockRepository.findById.mockResolvedValue(mockWorkout);
      mockExerciseService.findById.mockResolvedValue(mockExercise);
      
      // Mock saves
      mockEntityManager.save.mockImplementation((EntityClass, data) => {
        if (EntityClass.name === 'TrainingDay') {
          return Promise.resolve({ id: 'td-new', ...data });
        }
        if (EntityClass.name === 'TrainingDayExercise') {
          // Verify that sets is calculated correctly
          expect(data.sets).toBe(5); // 2 + 2 + 1 = 5
          return Promise.resolve({ id: 'tde-new', ...data });
        }
        return Promise.resolve(data);
      });

      // Execute
      await service.updateWorkoutExercises(input);

      // Verify
      expect(mockEntityManager.save).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          sets: 5,
          order: 0,
        })
      );
    });

    it('should use default sets value when no rep schemes provided', async () => {
      const mockWorkout = {
        id: '1',
        startedAt: null,
        trainingDays: [],
      };

      const mockExercise = {
        id: 'ex1',
        name: 'Squat',
      };

      const input: UpdateWorkoutExercisesInput = {
        workoutId: '1',
        trainingDays: [
          {
            name: 'Day 1',
            order: 0,
            dayOfWeek: 0,
            exercises: [
              {
                exerciseId: 'ex1',
                order: 0,
                repSchemes: [],
                restIntervals: [],
              },
            ],
          },
        ],
      };

      mockRepository.findById.mockResolvedValue(mockWorkout);
      mockExerciseService.findById.mockResolvedValue(mockExercise);
      
      mockEntityManager.save.mockImplementation((EntityClass, data) => {
        if (EntityClass.name === 'TrainingDayExercise') {
          // Verify default sets value
          expect(data.sets).toBe(1);
          return Promise.resolve({ id: 'tde-new', ...data });
        }
        return Promise.resolve(data);
      });

      await service.updateWorkoutExercises(input);

      expect(mockEntityManager.save).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          sets: 1,
        })
      );
    });

    it('should handle single set correctly', async () => {
      const mockWorkout = {
        id: '1',
        startedAt: null,
        trainingDays: [],
      };

      const mockExercise = {
        id: 'ex1',
        name: 'Deadlift',
      };

      const input: UpdateWorkoutExercisesInput = {
        workoutId: '1',
        trainingDays: [
          {
            name: 'Day 1',
            order: 0,
            dayOfWeek: 0,
            exercises: [
              {
                exerciseId: 'ex1',
                order: 0,
                repSchemes: [
                  { sets: 4, minReps: 8, maxReps: 10 },
                ],
                restIntervals: [],
              },
            ],
          },
        ],
      };

      mockRepository.findById.mockResolvedValue(mockWorkout);
      mockExerciseService.findById.mockResolvedValue(mockExercise);
      
      mockEntityManager.save.mockImplementation((EntityClass, data) => {
        if (EntityClass.name === 'TrainingDayExercise') {
          expect(data.sets).toBe(4);
          return Promise.resolve({ id: 'tde-new', ...data });
        }
        return Promise.resolve(data);
      });

      await service.updateWorkoutExercises(input);
    });
  });

  describe('error handling', () => {
    it('should throw error if workout has already started', async () => {
      const mockWorkout = {
        id: '1',
        startedAt: new Date(), // Workout already started
        trainingDays: [],
      };

      mockRepository.findById.mockResolvedValue(mockWorkout);

      const input: UpdateWorkoutExercisesInput = {
        workoutId: '1',
        trainingDays: [],
      };

      await expect(service.updateWorkoutExercises(input)).rejects.toThrow(
        'Não é possível editar um treino que já foi iniciado.'
      );
    });

    it('should throw NotFoundException if workout not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const input: UpdateWorkoutExercisesInput = {
        workoutId: '999',
        trainingDays: [],
      };

      await expect(service.updateWorkoutExercises(input)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw NotFoundException if exercise not found', async () => {
      const mockWorkout = {
        id: '1',
        startedAt: null,
        trainingDays: [],
      };

      mockRepository.findById.mockResolvedValue(mockWorkout);
      mockExerciseService.findById.mockResolvedValue(null);

      const input: UpdateWorkoutExercisesInput = {
        workoutId: '1',
        trainingDays: [
          {
            name: 'Day 1',
            order: 0,
            dayOfWeek: 0,
            exercises: [
              {
                exerciseId: 'non-existent',
                order: 0,
                repSchemes: [],
                restIntervals: [],
              },
            ],
          },
        ],
      };

      await expect(service.updateWorkoutExercises(input)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});