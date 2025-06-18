import { useState, useCallback } from 'react';
import { useMutation, gql } from '@apollo/client';

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
}

export function useWorkoutHistory(): UseWorkoutHistoryReturn {
  const [success, setSuccess] = useState(false);
  
  const [createWorkoutHistoryMutation, { loading, error }] = useMutation(
    CREATE_WORKOUT_HISTORY,
    {
      onCompleted: () => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000); // Reset success after 3 seconds
      },
      onError: (err) => {
        console.error('Error saving workout history:', err);
      }
    }
  );

  const saveWorkoutHistory = useCallback(async (data: WorkoutHistoryData) => {
    try {
      setSuccess(false);
      
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

      await createWorkoutHistoryMutation({
        variables: { createWorkoutHistoryInput: input }
      });
    } catch (err) {
      console.error('Failed to save workout history:', err);
      throw err;
    }
  }, [createWorkoutHistoryMutation]);

  return {
    saveWorkoutHistory,
    loading,
    error,
    success,
  };
}