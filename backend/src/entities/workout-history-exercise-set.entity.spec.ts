import { WorkoutHistoryExerciseSet } from './workout-history-exercise-set.entity';
import { WorkoutHistoryExercise } from './workout-history-exercise.entity';
import { WorkoutHistory } from './workout-history.entity';
import { Exercise } from './exercise.entity';
import { User } from './user.entity';
import { Workout } from './workout.entity';
import { UserRole } from '../utils/roles.enum';

describe('WorkoutHistoryExerciseSet Entity', () => {
  let workoutHistoryExerciseSet: WorkoutHistoryExerciseSet;
  let mockWorkoutHistoryExercise: WorkoutHistoryExercise;
  let mockWorkoutHistory: WorkoutHistory;
  let mockExercise: Exercise;
  let mockUser: User;
  let mockWorkout: Workout;

  beforeEach(() => {
    mockUser = new User();
    mockUser.id = 'user-1';
    mockUser.name = 'Test User';
    mockUser.email = 'test@example.com';
    mockUser.role = UserRole.CLIENT;

    mockWorkout = new Workout();
    mockWorkout.id = 'workout-1';
    mockWorkout.name = 'Test Workout';
    mockWorkout.user = mockUser;

    mockWorkoutHistory = new WorkoutHistory();
    mockWorkoutHistory.id = 'history-1';
    mockWorkoutHistory.user = mockUser;
    mockWorkoutHistory.workout = mockWorkout;

    mockExercise = new Exercise();
    mockExercise.id = 'exercise-1';
    mockExercise.name = 'Supino Reto';

    mockWorkoutHistoryExercise = new WorkoutHistoryExercise();
    mockWorkoutHistoryExercise.id = 'history-exercise-1';
    mockWorkoutHistoryExercise.workoutHistory = mockWorkoutHistory;
    mockWorkoutHistoryExercise.exercise = mockExercise;
    mockWorkoutHistoryExercise.exerciseName = 'Supino Reto';

    workoutHistoryExerciseSet = new WorkoutHistoryExerciseSet();
  });

  describe('Entity Properties', () => {
    it('should create a WorkoutHistoryExerciseSet instance', () => {
      expect(workoutHistoryExerciseSet).toBeDefined();
      expect(workoutHistoryExerciseSet).toBeInstanceOf(WorkoutHistoryExerciseSet);
    });

    it('should have all required properties', () => {
      const executedAt = new Date();
      
      workoutHistoryExerciseSet.workoutHistoryExercise = mockWorkoutHistoryExercise;
      workoutHistoryExerciseSet.setNumber = 1;
      workoutHistoryExerciseSet.weight = 80.5;
      workoutHistoryExerciseSet.reps = 12;
      workoutHistoryExerciseSet.plannedRepsMin = 10;
      workoutHistoryExerciseSet.plannedRepsMax = 12;
      workoutHistoryExerciseSet.restSeconds = 90;
      workoutHistoryExerciseSet.isCompleted = true;
      workoutHistoryExerciseSet.isFailure = false;
      workoutHistoryExerciseSet.notes = 'Primeira série boa';
      workoutHistoryExerciseSet.executedAt = executedAt;

      expect(workoutHistoryExerciseSet.workoutHistoryExercise).toBe(mockWorkoutHistoryExercise);
      expect(workoutHistoryExerciseSet.setNumber).toBe(1);
      expect(workoutHistoryExerciseSet.weight).toBe(80.5);
      expect(workoutHistoryExerciseSet.reps).toBe(12);
      expect(workoutHistoryExerciseSet.plannedRepsMin).toBe(10);
      expect(workoutHistoryExerciseSet.plannedRepsMax).toBe(12);
      expect(workoutHistoryExerciseSet.restSeconds).toBe(90);
      expect(workoutHistoryExerciseSet.isCompleted).toBe(true);
      expect(workoutHistoryExerciseSet.isFailure).toBe(false);
      expect(workoutHistoryExerciseSet.notes).toBe('Primeira série boa');
      expect(workoutHistoryExerciseSet.executedAt).toBe(executedAt);
    });

    it('should allow nullable fields to be null', () => {
      workoutHistoryExerciseSet.workoutHistoryExercise = mockWorkoutHistoryExercise;
      workoutHistoryExerciseSet.setNumber = 1;
      workoutHistoryExerciseSet.isCompleted = false;
      workoutHistoryExerciseSet.isFailure = false;

      expect(workoutHistoryExerciseSet.weight).toBeUndefined();
      expect(workoutHistoryExerciseSet.reps).toBeUndefined();
      expect(workoutHistoryExerciseSet.plannedRepsMin).toBeUndefined();
      expect(workoutHistoryExerciseSet.plannedRepsMax).toBeUndefined();
      expect(workoutHistoryExerciseSet.restSeconds).toBeUndefined();
      expect(workoutHistoryExerciseSet.notes).toBeUndefined();
      expect(workoutHistoryExerciseSet.executedAt).toBeUndefined();
    });

    it('should have default boolean values', () => {
      workoutHistoryExerciseSet.isCompleted = false;
      workoutHistoryExerciseSet.isFailure = false;
      
      expect(workoutHistoryExerciseSet.isCompleted).toBe(false);
      expect(workoutHistoryExerciseSet.isFailure).toBe(false);
    });
  });

  describe('Relationships', () => {
    it('should have a relationship with WorkoutHistoryExercise', () => {
      workoutHistoryExerciseSet.workoutHistoryExercise = mockWorkoutHistoryExercise;
      
      expect(workoutHistoryExerciseSet.workoutHistoryExercise).toBe(mockWorkoutHistoryExercise);
      expect(workoutHistoryExerciseSet.workoutHistoryExercise.id).toBe('history-exercise-1');
    });
  });

  describe('Business Logic Validation', () => {
    it('should handle valid set numbers', () => {
      workoutHistoryExerciseSet.setNumber = 1;
      expect(workoutHistoryExerciseSet.setNumber).toBe(1);
      
      workoutHistoryExerciseSet.setNumber = 10;
      expect(workoutHistoryExerciseSet.setNumber).toBe(10);
    });

    it('should handle decimal weight values', () => {
      workoutHistoryExerciseSet.weight = 80.25;
      expect(workoutHistoryExerciseSet.weight).toBe(80.25);
      
      workoutHistoryExerciseSet.weight = 100.0;
      expect(workoutHistoryExerciseSet.weight).toBe(100.0);
      
      workoutHistoryExerciseSet.weight = 0.5;
      expect(workoutHistoryExerciseSet.weight).toBe(0.5);
    });

    it('should validate rep range logic', () => {
      workoutHistoryExerciseSet.plannedRepsMin = 8;
      workoutHistoryExerciseSet.plannedRepsMax = 12;
      workoutHistoryExerciseSet.reps = 10;
      
      expect(workoutHistoryExerciseSet.reps).toBeGreaterThanOrEqual(workoutHistoryExerciseSet.plannedRepsMin);
      expect(workoutHistoryExerciseSet.reps).toBeLessThanOrEqual(workoutHistoryExerciseSet.plannedRepsMax);
    });

    it('should handle completion status logic', () => {
      // Successful completion within range
      workoutHistoryExerciseSet.plannedRepsMin = 10;
      workoutHistoryExerciseSet.plannedRepsMax = 12;
      workoutHistoryExerciseSet.reps = 12;
      workoutHistoryExerciseSet.isCompleted = true;
      workoutHistoryExerciseSet.isFailure = false;
      
      expect(workoutHistoryExerciseSet.isCompleted).toBe(true);
      expect(workoutHistoryExerciseSet.isFailure).toBe(false);
      
      // Failure scenario
      workoutHistoryExerciseSet.reps = 8;
      workoutHistoryExerciseSet.isCompleted = false;
      workoutHistoryExerciseSet.isFailure = true;
      
      expect(workoutHistoryExerciseSet.isCompleted).toBe(false);
      expect(workoutHistoryExerciseSet.isFailure).toBe(true);
    });

    it('should handle rest time in seconds', () => {
      workoutHistoryExerciseSet.restSeconds = 60;
      expect(workoutHistoryExerciseSet.restSeconds).toBe(60);
      
      workoutHistoryExerciseSet.restSeconds = 120;
      expect(workoutHistoryExerciseSet.restSeconds).toBe(120);
      
      workoutHistoryExerciseSet.restSeconds = 0;
      expect(workoutHistoryExerciseSet.restSeconds).toBe(0);
    });
  });

  describe('Data Integrity', () => {
    it('should allow long notes text', () => {
      const longNotes = 'Detailed notes about this specific set execution. '.repeat(100);
      workoutHistoryExerciseSet.notes = longNotes;
      
      expect(workoutHistoryExerciseSet.notes.length).toBeGreaterThan(1000);
      expect(workoutHistoryExerciseSet.notes).toBe(longNotes);
    });

    it('should handle execution timestamp', () => {
      const executedAt = new Date('2024-01-15T10:30:45Z');
      workoutHistoryExerciseSet.executedAt = executedAt;
      
      expect(workoutHistoryExerciseSet.executedAt).toBeInstanceOf(Date);
      expect(workoutHistoryExerciseSet.executedAt.getTime()).toBe(executedAt.getTime());
    });

    it('should handle large weight values', () => {
      workoutHistoryExerciseSet.weight = 999999.99;
      expect(workoutHistoryExerciseSet.weight).toBe(999999.99);
    });

    it('should handle high repetition counts', () => {
      workoutHistoryExerciseSet.reps = 100;
      workoutHistoryExerciseSet.plannedRepsMin = 50;
      workoutHistoryExerciseSet.plannedRepsMax = 100;
      
      expect(workoutHistoryExerciseSet.reps).toBe(100);
      expect(workoutHistoryExerciseSet.plannedRepsMin).toBe(50);
      expect(workoutHistoryExerciseSet.plannedRepsMax).toBe(100);
    });
  });

  describe('Real World Scenarios', () => {
    it('should handle successful set completion scenario', () => {
      // User completes set within planned range
      workoutHistoryExerciseSet.workoutHistoryExercise = mockWorkoutHistoryExercise;
      workoutHistoryExerciseSet.setNumber = 1;
      workoutHistoryExerciseSet.weight = 80.0;
      workoutHistoryExerciseSet.reps = 12;
      workoutHistoryExerciseSet.plannedRepsMin = 10;
      workoutHistoryExerciseSet.plannedRepsMax = 12;
      workoutHistoryExerciseSet.restSeconds = 90;
      workoutHistoryExerciseSet.isCompleted = true;
      workoutHistoryExerciseSet.isFailure = false;
      workoutHistoryExerciseSet.notes = 'Primeira série boa, execução perfeita';
      workoutHistoryExerciseSet.executedAt = new Date();

      expect(workoutHistoryExerciseSet.reps).toBe(12);
      expect(workoutHistoryExerciseSet.isCompleted).toBe(true);
      expect(workoutHistoryExerciseSet.isFailure).toBe(false);
      expect(workoutHistoryExerciseSet.notes).toContain('boa');
    });

    it('should handle failure scenario from the example', () => {
      // Third set from the supino example - user failed at 9 reps
      workoutHistoryExerciseSet.workoutHistoryExercise = mockWorkoutHistoryExercise;
      workoutHistoryExerciseSet.setNumber = 3;
      workoutHistoryExerciseSet.weight = 80.0;
      workoutHistoryExerciseSet.reps = 9;
      workoutHistoryExerciseSet.plannedRepsMin = 10;
      workoutHistoryExerciseSet.plannedRepsMax = 12;
      workoutHistoryExerciseSet.isCompleted = false;
      workoutHistoryExerciseSet.isFailure = true;
      workoutHistoryExerciseSet.notes = 'Falhei com 9, músculo já estava fatigado';
      workoutHistoryExerciseSet.executedAt = new Date();

      expect(workoutHistoryExerciseSet.reps).toBeLessThan(workoutHistoryExerciseSet.plannedRepsMin);
      expect(workoutHistoryExerciseSet.isCompleted).toBe(false);
      expect(workoutHistoryExerciseSet.isFailure).toBe(true);
      expect(workoutHistoryExerciseSet.notes).toContain('Falhei');
      expect(workoutHistoryExerciseSet.notes).toContain('fatigado');
    });

    it('should handle progressive set degradation scenario', () => {
      // Simulating the example: 12, 11, 9 reps across 3 sets
      const sets = [
        { setNumber: 1, reps: 12, notes: 'Primeira série boa', isCompleted: true, isFailure: false },
        { setNumber: 2, reps: 11, notes: 'Segunda mais pesada', isCompleted: true, isFailure: false },
        { setNumber: 3, reps: 9, notes: 'Terceira falhei com 9', isCompleted: false, isFailure: true }
      ];

      sets.forEach(setData => {
        const set = new WorkoutHistoryExerciseSet();
        set.workoutHistoryExercise = mockWorkoutHistoryExercise;
        set.setNumber = setData.setNumber;
        set.weight = 80.0;
        set.reps = setData.reps;
        set.plannedRepsMin = 10;
        set.plannedRepsMax = 12;
        set.isCompleted = setData.isCompleted;
        set.isFailure = setData.isFailure;
        set.notes = setData.notes;

        if (setData.setNumber === 1) {
          expect(set.reps).toBe(12); // Perfect
          expect(set.isCompleted).toBe(true);
        } else if (setData.setNumber === 2) {
          expect(set.reps).toBe(11); // Still within range
          expect(set.isCompleted).toBe(true);
        } else if (setData.setNumber === 3) {
          expect(set.reps).toBe(9); // Below minimum
          expect(set.isFailure).toBe(true);
        }
      });
    });

    it('should handle bodyweight exercise scenario', () => {
      // Exercise without weight (like push-ups)
      workoutHistoryExerciseSet.workoutHistoryExercise = mockWorkoutHistoryExercise;
      workoutHistoryExerciseSet.setNumber = 1;
      // No weight for bodyweight exercise - weight remains undefined
      workoutHistoryExerciseSet.reps = 20;
      workoutHistoryExerciseSet.plannedRepsMin = 15;
      workoutHistoryExerciseSet.plannedRepsMax = 25;
      workoutHistoryExerciseSet.isCompleted = true;
      workoutHistoryExerciseSet.isFailure = false;
      workoutHistoryExerciseSet.notes = 'Flexões - boa execução';

      expect(workoutHistoryExerciseSet.weight).toBeUndefined();
      expect(workoutHistoryExerciseSet.reps).toBe(20);
      expect(workoutHistoryExerciseSet.isCompleted).toBe(true);
    });

    it('should handle time-based exercise scenario', () => {
      // Exercise measured in time (like plank)
      workoutHistoryExerciseSet.workoutHistoryExercise = mockWorkoutHistoryExercise;
      workoutHistoryExerciseSet.setNumber = 1;
      // Time-based exercise - weight remains undefined
      workoutHistoryExerciseSet.reps = 60; // 60 seconds
      workoutHistoryExerciseSet.plannedRepsMin = 45;
      workoutHistoryExerciseSet.plannedRepsMax = 60;
      workoutHistoryExerciseSet.isCompleted = true;
      workoutHistoryExerciseSet.notes = 'Prancha - mantive 60 segundos';

      expect(workoutHistoryExerciseSet.reps).toBe(60);
      expect(workoutHistoryExerciseSet.notes).toContain('segundos');
    });
  });
});