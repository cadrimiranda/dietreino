import { useQuery, gql } from '@apollo/client';
import { useMemo } from 'react';
import { 
  WorkoutHistoryType, 
  WorkoutHistoryExerciseType, 
  WorkoutHistoryExerciseSetType 
} from '@/generated/graphql';

const GET_WORKOUT_HISTORIES_BY_USER = gql`
  query GetWorkoutHistoriesByUser($userId: ID!) {
    workoutHistoriesByUser(userId: $userId) {
      id
      workoutId
      executedAt
      workoutName
      trainingDayName
      workoutHistoryExercises {
        id
        exerciseId
        exerciseName
        workoutHistoryExerciseSets {
          id
          setNumber
          weight
          reps
          isCompleted
          executedAt
        }
      }
    }
  }
`;

export interface ExerciseHistorySet {
  setNumber: number;
  weight?: number;
  reps: number;
  isCompleted: boolean;
  executedAt: string;
}

export interface ExerciseHistorySession {
  date: string;
  workoutName: string;
  trainingDayName: string;
  sets: ExerciseHistorySet[];
}

interface QueryData {
  workoutHistoriesByUser: WorkoutHistoryType[];
}

export interface UseExerciseHistoryReturn {
  getExerciseHistory: (exerciseId: string, limit?: number) => ExerciseHistorySession[];
  loading: boolean;
  error: any;
  refetch: () => void;
}

export function useExerciseHistory(userId: string): UseExerciseHistoryReturn {
  const { data, loading, error, refetch } = useQuery<QueryData>(GET_WORKOUT_HISTORIES_BY_USER, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const getExerciseHistory = useMemo(() => {
    return (exerciseId: string, limit: number = 5): ExerciseHistorySession[] => {
      if (!data?.workoutHistoriesByUser) {
        return [];
      }

      const exerciseSessions: ExerciseHistorySession[] = [];

      // Iterar por todos os históricos de treino
      data.workoutHistoriesByUser.forEach((workoutHistory) => {
        // Buscar exercícios que correspondem ao exerciseId
        const matchingExercises = workoutHistory.workoutHistoryExercises.filter(
          (exercise) => exercise.exerciseId === exerciseId
        );

        matchingExercises.forEach((exercise) => {
          const sets = exercise.workoutHistoryExerciseSets
            .sort((a, b) => a.setNumber - b.setNumber)
            .map((set) => ({
              setNumber: set.setNumber,
              weight: set.weight || undefined,
              reps: set.reps || 0,
              isCompleted: set.isCompleted,
              executedAt: set.executedAt || '',
            }));

          exerciseSessions.push({
            date: workoutHistory.executedAt,
            workoutName: workoutHistory.workoutName,
            trainingDayName: workoutHistory.trainingDayName,
            sets,
          });
        });
      });

      // Ordenar por data (mais recente primeiro) e limitar
      return exerciseSessions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    };
  }, [data]);

  return {
    getExerciseHistory,
    loading,
    error,
    refetch: () => refetch(),
  };
}