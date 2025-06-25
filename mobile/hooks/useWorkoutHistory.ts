import { useState, useCallback } from 'react';
import { useMutation, gql, useApolloClient } from '@apollo/client';

const CREATE_WORKOUT_HISTORY = gql`
  mutation CreateWorkoutHistory($createWorkoutHistoryInput: CreateWorkoutHistoryInput!) {
    createWorkoutHistory(createWorkoutHistoryInput: $createWorkoutHistoryInput) {
      id
      userId
      workoutId
      executedAt
      workoutName
      trainingDayName
      trainingDayOrder
      notes
      durationMinutes
      workoutHistoryExercises {
        id
        exerciseId
        exerciseName
        order
        plannedSets
        completedSets
        notes
        workoutHistoryExerciseSets {
          id
          setNumber
          weight
          reps
          plannedRepsMin
          plannedRepsMax
          restSeconds
          isCompleted
          isFailure
          notes
          executedAt
        }
      }
    }
  }
`;

export interface WorkoutHistorySet {
  setNumber: number;
  weight?: number;
  reps: number;
  plannedRepsMin?: number;
  plannedRepsMax?: number;
  restSeconds?: number;
  isCompleted: boolean;
  isFailure: boolean;
  notes?: string;
  executedAt: Date;
}

export interface WorkoutHistoryExercise {
  exerciseId: string;
  exerciseName: string;
  order: number;
  plannedSets: number;
  completedSets: number;
  notes?: string;
  sets: WorkoutHistorySet[];
}

export interface WorkoutHistoryData {
  userId: string;
  workoutId: string;
  executedAt: Date;
  workoutName: string;
  trainingDayName: string;
  trainingDayOrder: number;
  notes?: string;
  durationMinutes?: number;
  exercises: WorkoutHistoryExercise[];
}

export interface UseWorkoutHistoryReturn {
  saveWorkoutHistory: (data: WorkoutHistoryData) => Promise<void>;
  loading: boolean;
  error: any;
  success: boolean;
  progress: {
    step: 'preparing' | 'validating' | 'uploading' | 'completed' | 'idle';
    message: string;
  };
}

export function useWorkoutHistory(): UseWorkoutHistoryReturn {
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState<{
    step: 'preparing' | 'validating' | 'uploading' | 'completed' | 'idle';
    message: string;
  }>({
    step: 'idle',
    message: ''
  });

  const apolloClient = useApolloClient();
  
  const [createWorkoutHistoryMutation, { loading, error }] = useMutation(
    CREATE_WORKOUT_HISTORY,
    {
      onCompleted: (data) => {
        setProgress({
          step: 'completed',
          message: 'Histórico salvo com sucesso!'
        });
        setSuccess(true);
        
        // Invalidate related queries to refresh cache
        apolloClient.refetchQueries({
          include: ['GetWorkoutHistoriesByUser']
        });

        // Reset states after delay
        setTimeout(() => {
          setSuccess(false);
          setProgress({ step: 'idle', message: '' });
        }, 3000);
      },
      onError: (err) => {
        console.error('Error saving workout history:', err);
        setProgress({
          step: 'idle',
          message: 'Erro ao salvar histórico'
        });
      }
    }
  );

  const saveWorkoutHistory = useCallback(async (data: WorkoutHistoryData) => {
    try {
      setSuccess(false);
      
      // Step 1: Preparing
      setProgress({
        step: 'preparing',
        message: 'Preparando dados do treino...'
      });

      // Basic validation
      if (!data.userId || !data.workoutId || !data.exercises.length) {
        throw new Error('Dados obrigatórios do treino estão faltando');
      }

      // Step 2: Validating
      setProgress({
        step: 'validating',
        message: 'Validando dados do treino...'
      });

      const input = {
        userId: data.userId,
        workoutId: data.workoutId,
        executedAt: data.executedAt.toISOString(),
        workoutName: data.workoutName,
        trainingDayName: data.trainingDayName,
        trainingDayOrder: data.trainingDayOrder,
        notes: data.notes,
        durationMinutes: data.durationMinutes,
        exercises: data.exercises.map(exercise => ({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          order: exercise.order,
          plannedSets: exercise.plannedSets,
          completedSets: exercise.completedSets,
          notes: exercise.notes,
          sets: exercise.sets.map(set => ({
            setNumber: set.setNumber,
            weight: set.weight,
            reps: set.reps,
            plannedRepsMin: set.plannedRepsMin,
            plannedRepsMax: set.plannedRepsMax,
            restSeconds: set.restSeconds,
            isCompleted: set.isCompleted,
            isFailure: set.isFailure,
            notes: set.notes,
            executedAt: set.executedAt.toISOString(),
          }))
        }))
      };

      // Step 3: Uploading
      setProgress({
        step: 'uploading',
        message: 'Salvando histórico no servidor...'
      });

      await createWorkoutHistoryMutation({
        variables: { createWorkoutHistoryInput: input }
      });
    } catch (err) {
      console.error('Failed to save workout history:', err);
      setProgress({
        step: 'idle',
        message: 'Erro ao salvar histórico'
      });
      throw err;
    }
  }, [createWorkoutHistoryMutation]);

  return {
    saveWorkoutHistory,
    loading,
    error,
    success,
    progress,
  };
}