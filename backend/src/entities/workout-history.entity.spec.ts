import { WorkoutHistory } from './workout-history.entity';
import { User } from './user.entity';
import { Workout } from './workout.entity';
import { WorkoutHistoryExercise } from './workout-history-exercise.entity';
import { UserRole } from '../utils/roles.enum';

describe('WorkoutHistory Entity', () => {
  let workoutHistory: WorkoutHistory;
  let mockUser: User;
  let mockWorkout: Workout;

  beforeEach(() => {
    mockUser = new User();
    mockUser.id = 'user-1';
    mockUser.name = 'Test User';
    mockUser.email = 'test@example.com';
    mockUser.password = 'hashedPassword';
    mockUser.role = UserRole.CLIENT;

    mockWorkout = new Workout();
    mockWorkout.id = 'workout-1';
    mockWorkout.name = 'Test Workout';
    mockWorkout.is_active = true;
    mockWorkout.user = mockUser;

    workoutHistory = new WorkoutHistory();
  });

  describe('Entity Properties', () => {
    it('should create a WorkoutHistory instance', () => {
      expect(workoutHistory).toBeDefined();
      expect(workoutHistory).toBeInstanceOf(WorkoutHistory);
    });

    it('should have all required properties', () => {
      const executedAt = new Date();

      workoutHistory.user = mockUser;
      workoutHistory.workout = mockWorkout;
      workoutHistory.executedAt = executedAt;
      workoutHistory.workoutName = 'Treino A - Peito';
      workoutHistory.trainingDayOrder = 1;
      workoutHistory.trainingDayName = 'Segunda - Peito';
      workoutHistory.notes = 'Treino intenso hoje';
      workoutHistory.durationMinutes = 45;

      expect(workoutHistory.user).toBe(mockUser);
      expect(workoutHistory.workout).toBe(mockWorkout);
      expect(workoutHistory.executedAt).toBe(executedAt);
      expect(workoutHistory.workoutName).toBe('Treino A - Peito');
      expect(workoutHistory.trainingDayOrder).toBe(1);
      expect(workoutHistory.trainingDayName).toBe('Segunda - Peito');
      expect(workoutHistory.notes).toBe('Treino intenso hoje');
      expect(workoutHistory.durationMinutes).toBe(45);
    });

    it('should allow nullable fields to be null', () => {
      workoutHistory.user = mockUser;
      workoutHistory.workout = mockWorkout;
      workoutHistory.executedAt = new Date();
      workoutHistory.workoutName = 'Test Workout';
      workoutHistory.trainingDayOrder = 1;
      workoutHistory.trainingDayName = 'Day 1';

      expect(workoutHistory.notes).toBeUndefined();
      expect(workoutHistory.durationMinutes).toBeUndefined();
    });
  });

  describe('Relationships', () => {
    it('should have a relationship with User', () => {
      workoutHistory.user = mockUser;
      expect(workoutHistory.user).toBe(mockUser);
      expect(workoutHistory.user.id).toBe('user-1');
    });

    it('should have a relationship with Workout', () => {
      workoutHistory.workout = mockWorkout;
      expect(workoutHistory.workout).toBe(mockWorkout);
      expect(workoutHistory.workout.id).toBe('workout-1');
    });

    it('should have a relationship with WorkoutHistoryExercises', () => {
      const mockExercise1 = new WorkoutHistoryExercise();
      const mockExercise2 = new WorkoutHistoryExercise();

      workoutHistory.workoutHistoryExercises = [mockExercise1, mockExercise2];

      expect(workoutHistory.workoutHistoryExercises).toHaveLength(2);
      expect(workoutHistory.workoutHistoryExercises).toContain(mockExercise1);
      expect(workoutHistory.workoutHistoryExercises).toContain(mockExercise2);
    });
  });

  describe('Business Logic Validation', () => {
    it('should validate that executedAt is a valid date', () => {
      const validDate = new Date('2024-01-15T10:30:00Z');
      workoutHistory.executedAt = validDate;

      expect(workoutHistory.executedAt).toBeInstanceOf(Date);
      expect(workoutHistory.executedAt.getTime()).toBe(validDate.getTime());
    });

    it('should handle training day order within valid range', () => {
      workoutHistory.trainingDayOrder = 1;
      expect(workoutHistory.trainingDayOrder).toBe(1);

      workoutHistory.trainingDayOrder = 7;
      expect(workoutHistory.trainingDayOrder).toBe(7);
    });

    it('should handle duration in minutes as positive integer', () => {
      workoutHistory.durationMinutes = 0;
      expect(workoutHistory.durationMinutes).toBe(0);

      workoutHistory.durationMinutes = 120;
      expect(workoutHistory.durationMinutes).toBe(120);
    });

    it('should preserve workout and training day names as snapshots', () => {
      workoutHistory.workoutName = 'Original Workout Name';
      workoutHistory.trainingDayName = 'Original Day Name';

      mockWorkout.name = 'Modified Workout Name';

      expect(workoutHistory.workoutName).toBe('Original Workout Name');
      expect(workoutHistory.trainingDayName).toBe('Original Day Name');
    });
  });

  describe('Data Integrity', () => {
    it('should maintain reference to original workout even if workout becomes inactive', () => {
      mockWorkout.is_active = false;
      workoutHistory.workout = mockWorkout;

      expect(workoutHistory.workout.is_active).toBe(false);
      expect(workoutHistory.workout.id).toBe('workout-1');
    });

    it('should allow long notes text', () => {
      const longNotes = 'A'.repeat(1000);
      workoutHistory.notes = longNotes;

      expect(workoutHistory.notes).toHaveLength(1000);
      expect(workoutHistory.notes).toBe(longNotes);
    });

    it('should handle workout name within length limit', () => {
      const workoutName = 'A'.repeat(100);
      workoutHistory.workoutName = workoutName;

      expect(workoutHistory.workoutName).toHaveLength(100);
      expect(workoutHistory.workoutName).toBe(workoutName);
    });

    it('should handle training day name within length limit', () => {
      const dayName = 'B'.repeat(100);
      workoutHistory.trainingDayName = dayName;

      expect(workoutHistory.trainingDayName).toHaveLength(100);
      expect(workoutHistory.trainingDayName).toBe(dayName);
    });
  });
});
