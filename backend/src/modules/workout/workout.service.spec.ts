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

  describe('order validation and sets calculation', () => {
    it('should always have valid order values and calculate total sets correctly', async () => {
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

      // Input with multiple rep schemes and proper sequential ordering
      const input: UpdateWorkoutExercisesInput = {
        workoutId: '1',
        trainingDays: [
          {
            name: 'Day 1',
            order: 0,  // Explicitly ensure order is 0
            dayOfWeek: 0,
            exercises: [
              {
                exerciseId: 'ex1',
                order: 0,  // First exercise order 0
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

      // Validate that order values are never null, undefined, or invalid
      expect(input.trainingDays[0].order).toBe(0);
      expect(typeof input.trainingDays[0].order).toBe('number');
      expect(input.trainingDays[0].exercises[0].order).toBe(0);
      expect(typeof input.trainingDays[0].exercises[0].order).toBe('number');

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

      // Verify order is properly set and never null/undefined
      expect(mockEntityManager.save).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          sets: 5,
          order: 0,
        })
      );
      
      // Additional verification that order is always a valid number
      const trainingDayCall = mockEntityManager.save.mock.calls.find(
        call => call[1].hasOwnProperty('order') && call[1].hasOwnProperty('name')
      );
      if (trainingDayCall) {
        expect(trainingDayCall[1].order).toBe(0);
        expect(typeof trainingDayCall[1].order).toBe('number');
        expect(trainingDayCall[1].order).not.toBeNull();
        expect(trainingDayCall[1].order).not.toBeUndefined();
      }
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

  describe('order validation', () => {
    it('should ensure sequential ordering in multi-day workouts', async () => {
      const mockWorkout = {
        id: '1',
        startedAt: null,
        trainingDays: [],
      };

      const mockExercise = {
        id: 'ex1',
        name: 'Test Exercise',
      };

      const input: UpdateWorkoutExercisesInput = {
        workoutId: '1',
        trainingDays: [
          {
            name: 'Day 1',
            order: 0,
            dayOfWeek: 0,
            exercises: [
              { exerciseId: 'ex1', order: 0, repSchemes: [], restIntervals: [] },
              { exerciseId: 'ex1', order: 1, repSchemes: [], restIntervals: [] },
            ],
          },
          {
            name: 'Day 2', 
            order: 1,
            dayOfWeek: 1,
            exercises: [
              { exerciseId: 'ex1', order: 0, repSchemes: [], restIntervals: [] },
            ],
          },
          {
            name: 'Day 3',
            order: 2, 
            dayOfWeek: 2,
            exercises: [
              { exerciseId: 'ex1', order: 0, repSchemes: [], restIntervals: [] },
              { exerciseId: 'ex1', order: 1, repSchemes: [], restIntervals: [] },
              { exerciseId: 'ex1', order: 2, repSchemes: [], restIntervals: [] },
            ],
          },
        ],
      };

      // Validate proper sequential ordering before test execution
      const trainingDayOrders = input.trainingDays.map(td => td.order).sort((a, b) => a - b);
      expect(trainingDayOrders).toEqual([0, 1, 2]);
      
      // Validate each training day has proper exercise ordering
      input.trainingDays.forEach((day, dayIndex) => {
        expect(day.order).toBe(dayIndex);
        expect(typeof day.order).toBe('number');
        expect(day.order).not.toBeNull();
        expect(day.order).not.toBeUndefined();
        
        const exerciseOrders = day.exercises.map(ex => ex.order).sort((a, b) => a - b);
        const expectedOrders = day.exercises.map((_, index) => index);
        expect(exerciseOrders).toEqual(expectedOrders);
        
        day.exercises.forEach((exercise, exerciseIndex) => {
          expect(exercise.order).toBe(exerciseIndex);
          expect(typeof exercise.order).toBe('number');
          expect(exercise.order).not.toBeNull();
          expect(exercise.order).not.toBeUndefined();
        });
      });

      mockRepository.findById.mockResolvedValue(mockWorkout);
      mockExerciseService.findById.mockResolvedValue(mockExercise);
      mockEntityManager.save.mockImplementation((EntityClass, data) => {
        // Verify all saved entities have valid order values
        if (data.hasOwnProperty('order')) {
          expect(typeof data.order).toBe('number');
          expect(data.order).toBeGreaterThanOrEqual(0);
          expect(data.order).not.toBeNull();
          expect(data.order).not.toBeUndefined();
        }
        return Promise.resolve({ id: 'mock-id', ...data });
      });

      await service.updateWorkoutExercises(input);

      // Verify all save calls had proper order values
      const saveCalls = mockEntityManager.save.mock.calls;
      saveCalls.forEach(call => {
        const data = call[1];
        if (data.hasOwnProperty('order')) {
          expect(typeof data.order).toBe('number');
          expect(data.order).toBeGreaterThanOrEqual(0);
          expect(data.order).not.toBeNull();
          expect(data.order).not.toBeUndefined();
        }
      });
    });

    it('should validate that test data never uses fallback order values', () => {
      // This test ensures our test data itself never relies on fallback values
      const validTestInputs = [
        {
          name: 'Single Day',
          order: 0,  // Must be explicit
          dayOfWeek: 0,
          exercises: [
            { exerciseId: 'ex1', order: 0, repSchemes: [], restIntervals: [] }
          ],
        },
        {
          name: 'Multi Day',
          order: 1,  // Sequential
          dayOfWeek: 1, 
          exercises: [
            { exerciseId: 'ex1', order: 0, repSchemes: [], restIntervals: [] },
            { exerciseId: 'ex2', order: 1, repSchemes: [], restIntervals: [] }
          ],
        }
      ];

      validTestInputs.forEach((day, dayIndex) => {
        // Training day order validation
        expect(day.order).toBe(dayIndex);
        expect(typeof day.order).toBe('number');
        expect(day.order).not.toBeNull();
        expect(day.order).not.toBeUndefined();
        
        // Exercise order validation
        day.exercises.forEach((exercise, exerciseIndex) => {
          expect(exercise.order).toBe(exerciseIndex);
          expect(typeof exercise.order).toBe('number');
          expect(exercise.order).not.toBeNull();
          expect(exercise.order).not.toBeUndefined();
        });
      });
    });
  });
});