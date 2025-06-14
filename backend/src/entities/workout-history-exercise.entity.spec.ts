import { WorkoutHistoryExercise } from './workout-history-exercise.entity';
import { WorkoutHistory } from './workout-history.entity';
import { Exercise } from './exercise.entity';
import { WorkoutHistoryExerciseSet } from './workout-history-exercise-set.entity';
import { User } from './user.entity';
import { Workout } from './workout.entity';
import { UserRole } from '../utils/roles.enum';

describe('WorkoutHistoryExercise Entity', () => {
  let workoutHistoryExercise: WorkoutHistoryExercise;
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
    mockWorkoutHistory.executedAt = new Date();
    mockWorkoutHistory.workoutName = 'Test Workout History';

    mockExercise = new Exercise();
    mockExercise.id = 'exercise-1';
    mockExercise.name = 'Supino Reto';
    mockExercise.videoLink = 'https://example.com/video';

    workoutHistoryExercise = new WorkoutHistoryExercise();
  });

  describe('Entity Properties', () => {
    it('should create a WorkoutHistoryExercise instance', () => {
      expect(workoutHistoryExercise).toBeDefined();
      expect(workoutHistoryExercise).toBeInstanceOf(WorkoutHistoryExercise);
    });

    it('should have all required properties', () => {
      workoutHistoryExercise.workoutHistory = mockWorkoutHistory;
      workoutHistoryExercise.exercise = mockExercise;
      workoutHistoryExercise.order = 1;
      workoutHistoryExercise.exerciseName = 'Supino Reto';
      workoutHistoryExercise.plannedSets = 3;
      workoutHistoryExercise.completedSets = 3;
      workoutHistoryExercise.notes = 'Execução perfeita';

      expect(workoutHistoryExercise.workoutHistory).toBe(mockWorkoutHistory);
      expect(workoutHistoryExercise.exercise).toBe(mockExercise);
      expect(workoutHistoryExercise.order).toBe(1);
      expect(workoutHistoryExercise.exerciseName).toBe('Supino Reto');
      expect(workoutHistoryExercise.plannedSets).toBe(3);
      expect(workoutHistoryExercise.completedSets).toBe(3);
      expect(workoutHistoryExercise.notes).toBe('Execução perfeita');
    });

    it('should allow nullable fields to be null', () => {
      workoutHistoryExercise.workoutHistory = mockWorkoutHistory;
      workoutHistoryExercise.exercise = mockExercise;
      workoutHistoryExercise.order = 1;
      workoutHistoryExercise.exerciseName = 'Test Exercise';
      workoutHistoryExercise.plannedSets = 3;
      workoutHistoryExercise.completedSets = 2;

      expect(workoutHistoryExercise.notes).toBeUndefined();
    });
  });

  describe('Relationships', () => {
    it('should have a relationship with WorkoutHistory', () => {
      workoutHistoryExercise.workoutHistory = mockWorkoutHistory;
      
      expect(workoutHistoryExercise.workoutHistory).toBe(mockWorkoutHistory);
      expect(workoutHistoryExercise.workoutHistory.id).toBe('history-1');
    });

    it('should have a relationship with Exercise', () => {
      workoutHistoryExercise.exercise = mockExercise;
      
      expect(workoutHistoryExercise.exercise).toBe(mockExercise);
      expect(workoutHistoryExercise.exercise.id).toBe('exercise-1');
      expect(workoutHistoryExercise.exercise.name).toBe('Supino Reto');
    });

    it('should have a relationship with WorkoutHistoryExerciseSets', () => {
      const mockSet1 = new WorkoutHistoryExerciseSet();
      const mockSet2 = new WorkoutHistoryExerciseSet();
      const mockSet3 = new WorkoutHistoryExerciseSet();
      
      workoutHistoryExercise.workoutHistoryExerciseSets = [mockSet1, mockSet2, mockSet3];
      
      expect(workoutHistoryExercise.workoutHistoryExerciseSets).toHaveLength(3);
      expect(workoutHistoryExercise.workoutHistoryExerciseSets).toContain(mockSet1);
      expect(workoutHistoryExercise.workoutHistoryExerciseSets).toContain(mockSet2);
      expect(workoutHistoryExercise.workoutHistoryExerciseSets).toContain(mockSet3);
    });
  });

  describe('Business Logic Validation', () => {
    it('should handle valid exercise order', () => {
      workoutHistoryExercise.order = 1;
      expect(workoutHistoryExercise.order).toBe(1);
      
      workoutHistoryExercise.order = 10;
      expect(workoutHistoryExercise.order).toBe(10);
    });

    it('should handle planned vs completed sets comparison', () => {
      // Scenario: User completed all planned sets
      workoutHistoryExercise.plannedSets = 3;
      workoutHistoryExercise.completedSets = 3;
      
      expect(workoutHistoryExercise.completedSets).toBe(workoutHistoryExercise.plannedSets);
      
      // Scenario: User completed fewer sets than planned
      workoutHistoryExercise.completedSets = 2;
      expect(workoutHistoryExercise.completedSets).toBeLessThan(workoutHistoryExercise.plannedSets);
      
      // Scenario: User completed more sets than planned
      workoutHistoryExercise.completedSets = 4;
      expect(workoutHistoryExercise.completedSets).toBeGreaterThan(workoutHistoryExercise.plannedSets);
    });

    it('should preserve exercise name as snapshot', () => {
      workoutHistoryExercise.exerciseName = 'Original Exercise Name';
      mockExercise.name = 'Modified Exercise Name';
      
      expect(workoutHistoryExercise.exerciseName).toBe('Original Exercise Name');
      expect(mockExercise.name).toBe('Modified Exercise Name');
    });

    it('should handle zero completed sets', () => {
      workoutHistoryExercise.plannedSets = 3;
      workoutHistoryExercise.completedSets = 0;
      
      expect(workoutHistoryExercise.completedSets).toBe(0);
      expect(workoutHistoryExercise.completedSets).toBeLessThan(workoutHistoryExercise.plannedSets);
    });
  });

  describe('Data Integrity', () => {
    it('should handle exercise name within length limit', () => {
      const exerciseName = 'A'.repeat(100);
      workoutHistoryExercise.exerciseName = exerciseName;
      
      expect(workoutHistoryExercise.exerciseName).toHaveLength(100);
      expect(workoutHistoryExercise.exerciseName).toBe(exerciseName);
    });

    it('should allow long notes text', () => {
      const longNotes = 'Detailed notes about exercise execution. '.repeat(50);
      workoutHistoryExercise.notes = longNotes;
      
      expect(workoutHistoryExercise.notes.length).toBeGreaterThan(1000);
      expect(workoutHistoryExercise.notes).toBe(longNotes);
    });

    it('should handle positive integer values for sets', () => {
      workoutHistoryExercise.plannedSets = 1;
      workoutHistoryExercise.completedSets = 1;
      
      expect(workoutHistoryExercise.plannedSets).toBeGreaterThan(0);
      expect(workoutHistoryExercise.completedSets).toBeGreaterThan(0);
      
      workoutHistoryExercise.plannedSets = 10;
      workoutHistoryExercise.completedSets = 8;
      
      expect(workoutHistoryExercise.plannedSets).toBe(10);
      expect(workoutHistoryExercise.completedSets).toBe(8);
    });
  });

  describe('Real World Scenarios', () => {
    it('should handle partial workout completion scenario', () => {
      // User planned 4 sets but only completed 2 sets due to fatigue
      workoutHistoryExercise.workoutHistory = mockWorkoutHistory;
      workoutHistoryExercise.exercise = mockExercise;
      workoutHistoryExercise.order = 1;
      workoutHistoryExercise.exerciseName = 'Supino Reto';
      workoutHistoryExercise.plannedSets = 4;
      workoutHistoryExercise.completedSets = 2;
      workoutHistoryExercise.notes = 'Parei no 2º set por fadiga muscular excessiva';

      expect(workoutHistoryExercise.completedSets).toBeLessThan(workoutHistoryExercise.plannedSets);
      expect(workoutHistoryExercise.notes).toContain('fadiga');
    });

    it('should handle exceeded planned sets scenario', () => {
      // User felt good and did extra sets
      workoutHistoryExercise.plannedSets = 3;
      workoutHistoryExercise.completedSets = 4;
      workoutHistoryExercise.notes = 'Me senti bem e fiz uma série extra';

      expect(workoutHistoryExercise.completedSets).toBeGreaterThan(workoutHistoryExercise.plannedSets);
      expect(workoutHistoryExercise.notes).toContain('série extra');
    });

    it('should handle perfect execution scenario', () => {
      // User completed exactly as planned
      workoutHistoryExercise.plannedSets = 3;
      workoutHistoryExercise.completedSets = 3;
      workoutHistoryExercise.notes = 'Treino conforme planejado, boa execução';

      expect(workoutHistoryExercise.completedSets).toBe(workoutHistoryExercise.plannedSets);
      expect(workoutHistoryExercise.notes).toContain('conforme planejado');
    });
  });
});