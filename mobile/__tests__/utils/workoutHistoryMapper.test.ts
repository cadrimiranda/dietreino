import { WorkoutHistoryMapper } from '../../utils/workoutHistoryMapper';

describe('WorkoutHistoryMapper', () => {
  const mockExercises = [
    {
      id: 'exercise-1',
      name: 'Supino Reto',
      sets: 3,
      reps: '8-12',
      rest: '90s',
      restIntervals: [
        { id: 'rest-1', intervalTime: '90s', order: 1 },
        { id: 'rest-2', intervalTime: '120s', order: 2 }
      ]
    },
    {
      id: 'exercise-2',
      name: 'Supino Inclinado',
      sets: 3,
      reps: '10',
      rest: '60s',
      restIntervals: []
    }
  ];

  const mockExecutedSets = new Map([
    [0, [
      { id: 'set-1', weight: 80, reps: 10, completed: true },
      { id: 'set-2', weight: 82.5, reps: 8, completed: true },
      { id: 'set-3', weight: 85, reps: 6, completed: true }
    ]],
    [1, [
      { id: 'set-1', weight: 60, reps: 12, completed: true },
      { id: 'set-2', weight: 62.5, reps: 10, completed: true },
      { id: 'set-3', weight: 65, reps: 8, completed: false }
    ]]
  ]);

  const mockExerciseNotes = new Map([
    [0, 'Bom exercício, consegui progredir no peso'],
    [1, 'Senti bem o músculo trabalhando']
  ]);

  const mockExecutionData = {
    userId: 'user-123',
    workoutId: 'workout-456',
    workoutName: 'Treino de Peito',
    trainingDayName: 'Treino A',
    trainingDayOrder: 1,
    exercises: mockExercises,
    executedSets: mockExecutedSets,
    exerciseNotes: mockExerciseNotes,
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T11:30:00Z'),
    workoutNotes: 'Treino excelente'
  };

  describe('mapToWorkoutHistory', () => {
    it('should map basic workout data correctly', () => {
      const result = WorkoutHistoryMapper.mapToWorkoutHistory(mockExecutionData);

      expect(result.userId).toBe('user-123');
      expect(result.workoutId).toBe('workout-456');
      expect(result.workoutName).toBe('Treino de Peito');
      expect(result.trainingDayName).toBe('Treino A');
      expect(result.trainingDayOrder).toBe(1);
      expect(result.notes).toBe('Treino excelente');
      expect(result.executedAt).toEqual(new Date('2024-01-15T10:00:00Z'));
      expect(result.durationMinutes).toBe(90);
    });

    it('should map exercises correctly', () => {
      const result = WorkoutHistoryMapper.mapToWorkoutHistory(mockExecutionData);

      expect(result.exercises).toHaveLength(2);

      const firstExercise = result.exercises[0];
      expect(firstExercise.exerciseId).toBe('exercise-1');
      expect(firstExercise.exerciseName).toBe('Supino Reto');
      expect(firstExercise.order).toBe(1);
      expect(firstExercise.plannedSets).toBe(3);
      expect(firstExercise.completedSets).toBe(3);
      expect(firstExercise.notes).toBe('Bom exercício, consegui progredir no peso');

      const secondExercise = result.exercises[1];
      expect(secondExercise.exerciseId).toBe('exercise-2');
      expect(secondExercise.exerciseName).toBe('Supino Inclinado');
      expect(secondExercise.order).toBe(2);
      expect(secondExercise.plannedSets).toBe(3);
      expect(secondExercise.completedSets).toBe(2); // Only 2 completed
      expect(secondExercise.notes).toBe('Senti bem o músculo trabalhando');
    });

    it('should map sets correctly', () => {
      const result = WorkoutHistoryMapper.mapToWorkoutHistory(mockExecutionData);

      const firstExerciseSets = result.exercises[0].sets;
      expect(firstExerciseSets).toHaveLength(3);

      expect(firstExerciseSets[0]).toMatchObject({
        setNumber: 1,
        weight: 80,
        reps: 10,
        plannedRepsMin: 8,
        plannedRepsMax: 12,
        restSeconds: 90,
        isCompleted: true,
        isFailure: false
      });

      expect(firstExerciseSets[1]).toMatchObject({
        setNumber: 2,
        weight: 82.5,
        reps: 8,
        isCompleted: true
      });
    });

    it('should calculate duration correctly when endTime is provided', () => {
      const result = WorkoutHistoryMapper.mapToWorkoutHistory(mockExecutionData);
      expect(result.durationMinutes).toBe(90);
    });

    it('should handle missing endTime', () => {
      const dataWithoutEndTime = {
        ...mockExecutionData,
        endTime: undefined
      };
      
      const result = WorkoutHistoryMapper.mapToWorkoutHistory(dataWithoutEndTime);
      expect(result.durationMinutes).toBeUndefined();
    });

    it('should handle exercises without executed sets', () => {
      const dataWithEmptySets = {
        ...mockExecutionData,
        executedSets: new Map()
      };

      const result = WorkoutHistoryMapper.mapToWorkoutHistory(dataWithEmptySets);
      
      expect(result.exercises[0].sets).toHaveLength(0);
      expect(result.exercises[0].completedSets).toBe(0);
    });

    it('should handle exercises without notes', () => {
      const dataWithoutNotes = {
        ...mockExecutionData,
        exerciseNotes: new Map()
      };

      const result = WorkoutHistoryMapper.mapToWorkoutHistory(dataWithoutNotes);
      
      expect(result.exercises[0].notes).toBeUndefined();
      expect(result.exercises[1].notes).toBeUndefined();
    });
  });

  describe('parseRepsString', () => {
    // Testing private method through public interface
    it('should parse range reps correctly', () => {
      const mockData = {
        ...mockExecutionData,
        exercises: [{
          ...mockExercises[0],
          reps: '8-12'
        }],
        executedSets: new Map([[0, [{ id: 'set-1', weight: 80, reps: 10, completed: true }]]])
      };

      const result = WorkoutHistoryMapper.mapToWorkoutHistory(mockData);
      const set = result.exercises[0].sets[0];
      
      expect(set.plannedRepsMin).toBe(8);
      expect(set.plannedRepsMax).toBe(12);
    });

    it('should parse single rep value correctly', () => {
      const mockData = {
        ...mockExecutionData,
        exercises: [{
          ...mockExercises[0],
          reps: '10'
        }],
        executedSets: new Map([[0, [{ id: 'set-1', weight: 80, reps: 10, completed: true }]]])
      };

      const result = WorkoutHistoryMapper.mapToWorkoutHistory(mockData);
      const set = result.exercises[0].sets[0];
      
      expect(set.plannedRepsMin).toBe(10);
      expect(set.plannedRepsMax).toBe(10);
    });

    it('should handle range with spaces', () => {
      const mockData = {
        ...mockExecutionData,
        exercises: [{
          ...mockExercises[0],
          reps: '8 - 12'
        }],
        executedSets: new Map([[0, [{ id: 'set-1', weight: 80, reps: 10, completed: true }]]])
      };

      const result = WorkoutHistoryMapper.mapToWorkoutHistory(mockData);
      const set = result.exercises[0].sets[0];
      
      expect(set.plannedRepsMin).toBe(8);
      expect(set.plannedRepsMax).toBe(12);
    });

    it('should handle invalid reps string', () => {
      const mockData = {
        ...mockExecutionData,
        exercises: [{
          ...mockExercises[0],
          reps: 'invalid'
        }],
        executedSets: new Map([[0, [{ id: 'set-1', weight: 80, reps: 10, completed: true }]]])
      };

      const result = WorkoutHistoryMapper.mapToWorkoutHistory(mockData);
      const set = result.exercises[0].sets[0];
      
      expect(set.plannedRepsMin).toBeUndefined();
      expect(set.plannedRepsMax).toBeUndefined();
    });
  });

  describe('parseRestTime', () => {
    // Testing through public interface
    it('should parse seconds correctly', () => {
      const mockData = {
        ...mockExecutionData,
        exercises: [{
          ...mockExercises[0],
          rest: '90s'
        }],
        executedSets: new Map([[0, [{ id: 'set-1', weight: 80, reps: 10, completed: true }]]])
      };

      const result = WorkoutHistoryMapper.mapToWorkoutHistory(mockData);
      const set = result.exercises[0].sets[0];
      
      expect(set.restSeconds).toBe(90);
    });

    it('should parse minutes correctly', () => {
      const mockData = {
        ...mockExecutionData,
        exercises: [{
          ...mockExercises[0],
          rest: '2m'
        }],
        executedSets: new Map([[0, [{ id: 'set-1', weight: 80, reps: 10, completed: true }]]])
      };

      const result = WorkoutHistoryMapper.mapToWorkoutHistory(mockData);
      const set = result.exercises[0].sets[0];
      
      expect(set.restSeconds).toBe(120);
    });

    it('should parse minutes and seconds correctly', () => {
      const mockData = {
        ...mockExecutionData,
        exercises: [{
          ...mockExercises[0],
          rest: '1m30s'
        }],
        executedSets: new Map([[0, [{ id: 'set-1', weight: 80, reps: 10, completed: true }]]])
      };

      const result = WorkoutHistoryMapper.mapToWorkoutHistory(mockData);
      const set = result.exercises[0].sets[0];
      
      expect(set.restSeconds).toBe(90);
    });

    it('should parse plain number as seconds', () => {
      const mockData = {
        ...mockExecutionData,
        exercises: [{
          ...mockExercises[0],
          rest: '90'
        }],
        executedSets: new Map([[0, [{ id: 'set-1', weight: 80, reps: 10, completed: true }]]])
      };

      const result = WorkoutHistoryMapper.mapToWorkoutHistory(mockData);
      const set = result.exercises[0].sets[0];
      
      expect(set.restSeconds).toBe(90);
    });

    it('should handle empty rest time', () => {
      const mockData = {
        ...mockExecutionData,
        exercises: [{
          ...mockExercises[0],
          rest: ''
        }],
        executedSets: new Map([[0, [{ id: 'set-1', weight: 80, reps: 10, completed: true }]]])
      };

      const result = WorkoutHistoryMapper.mapToWorkoutHistory(mockData);
      const set = result.exercises[0].sets[0];
      
      expect(set.restSeconds).toBeUndefined();
    });
  });

  describe('weight handling', () => {
    it('should include weight when greater than 0', () => {
      const result = WorkoutHistoryMapper.mapToWorkoutHistory(mockExecutionData);
      const set = result.exercises[0].sets[0];
      
      expect(set.weight).toBe(80);
    });

    it('should exclude weight when 0', () => {
      const dataWithZeroWeight = {
        ...mockExecutionData,
        executedSets: new Map([[0, [{ id: 'set-1', weight: 0, reps: 10, completed: true }]]])
      };

      const result = WorkoutHistoryMapper.mapToWorkoutHistory(dataWithZeroWeight);
      const set = result.exercises[0].sets[0];
      
      expect(set.weight).toBeUndefined();
    });
  });
});