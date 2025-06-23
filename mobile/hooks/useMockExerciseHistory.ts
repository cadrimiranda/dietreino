import { useMemo } from 'react';
import { ExerciseHistorySession, ExerciseHistorySet } from './useExerciseHistory';

// Hook para simular dados de histórico de exercício para demonstração
export function useMockExerciseHistory() {
  const mockData = useMemo(() => {
    // Simular histórico de 3 sessões anteriores para diferentes exercícios
    const mockSessions: Record<string, ExerciseHistorySession[]> = {
      'exercise-1': [ // Supino Reto
        {
          date: '2024-01-20T10:30:00Z',
          workoutName: 'Treino Push',
          trainingDayName: 'Peito/Ombro/Tríceps',
          sets: [
            { setNumber: 1, weight: 80, reps: 10, isCompleted: true, executedAt: '2024-01-20T10:35:00Z' },
            { setNumber: 2, weight: 77.5, reps: 9, isCompleted: true, executedAt: '2024-01-20T10:40:00Z' },
            { setNumber: 3, weight: 75, reps: 8, isCompleted: true, executedAt: '2024-01-20T10:45:00Z' },
            { setNumber: 4, weight: 75, reps: 8, isCompleted: true, executedAt: '2024-01-20T10:50:00Z' },
          ]
        },
        {
          date: '2024-01-17T09:15:00Z',
          workoutName: 'Treino Push',
          trainingDayName: 'Peito/Ombro/Tríceps',
          sets: [
            { setNumber: 1, weight: 77.5, reps: 10, isCompleted: true, executedAt: '2024-01-17T09:20:00Z' },
            { setNumber: 2, weight: 75, reps: 9, isCompleted: true, executedAt: '2024-01-17T09:25:00Z' },
            { setNumber: 3, weight: 72.5, reps: 8, isCompleted: true, executedAt: '2024-01-17T09:30:00Z' },
            { setNumber: 4, weight: 70, reps: 8, isCompleted: true, executedAt: '2024-01-17T09:35:00Z' },
          ]
        },
        {
          date: '2024-01-15T11:00:00Z',
          workoutName: 'Treino Push',
          trainingDayName: 'Peito/Ombro/Tríceps',
          sets: [
            { setNumber: 1, weight: 75, reps: 10, isCompleted: true, executedAt: '2024-01-15T11:05:00Z' },
            { setNumber: 2, weight: 72.5, reps: 9, isCompleted: true, executedAt: '2024-01-15T11:10:00Z' },
            { setNumber: 3, weight: 70, reps: 8, isCompleted: true, executedAt: '2024-01-15T11:15:00Z' },
            { setNumber: 4, weight: 67.5, reps: 7, isCompleted: true, executedAt: '2024-01-15T11:20:00Z' },
          ]
        }
      ],
      'exercise-2': [ // Agachamento
        {
          date: '2024-01-19T14:00:00Z',
          workoutName: 'Treino Legs',
          trainingDayName: 'Pernas/Glúteos',
          sets: [
            { setNumber: 1, weight: 100, reps: 12, isCompleted: true, executedAt: '2024-01-19T14:05:00Z' },
            { setNumber: 2, weight: 100, reps: 11, isCompleted: true, executedAt: '2024-01-19T14:10:00Z' },
            { setNumber: 3, weight: 95, reps: 10, isCompleted: true, executedAt: '2024-01-19T14:15:00Z' },
            { setNumber: 4, weight: 90, reps: 10, isCompleted: true, executedAt: '2024-01-19T14:20:00Z' },
          ]
        },
        {
          date: '2024-01-16T15:30:00Z',
          workoutName: 'Treino Legs',
          trainingDayName: 'Pernas/Glúteos',
          sets: [
            { setNumber: 1, weight: 95, reps: 12, isCompleted: true, executedAt: '2024-01-16T15:35:00Z' },
            { setNumber: 2, weight: 95, reps: 11, isCompleted: true, executedAt: '2024-01-16T15:40:00Z' },
            { setNumber: 3, weight: 90, reps: 10, isCompleted: true, executedAt: '2024-01-16T15:45:00Z' },
            { setNumber: 4, weight: 85, reps: 9, isCompleted: true, executedAt: '2024-01-16T15:50:00Z' },
          ]
        }
      ],
      'exercise-3': [ // Desenvolvimento com Halteres
        {
          date: '2024-01-18T16:45:00Z',
          workoutName: 'Treino Push',
          trainingDayName: 'Peito/Ombro/Tríceps',
          sets: [
            { setNumber: 1, weight: 22.5, reps: 10, isCompleted: true, executedAt: '2024-01-18T16:50:00Z' },
            { setNumber: 2, weight: 20, reps: 9, isCompleted: true, executedAt: '2024-01-18T16:55:00Z' },
            { setNumber: 3, weight: 17.5, reps: 8, isCompleted: true, executedAt: '2024-01-18T17:00:00Z' },
          ]
        }
      ]
    };

    return mockSessions;
  }, []);

  const getMockExerciseHistory = (exerciseId: string, limit: number = 5) => {
    const sessions = mockData[exerciseId] || [];
    return sessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };

  return {
    getMockExerciseHistory,
    loading: false,
    error: null,
    refetch: () => {},
  };
}