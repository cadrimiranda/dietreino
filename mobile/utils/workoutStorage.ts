import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKOUT_STATE_KEY = '@workout_state';

export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  restIntervals?: Array<{
    id: string;
    intervalTime: string;
    order: number;
  }>;
  completed?: boolean;
}

export interface WorkoutExecutionState {
  isInProgress: boolean;
  workoutId: string;
  trainingDayName: string;
  exercises: Exercise[];
  currentExerciseIndex: number;
  allExerciseSets: Record<number, ExerciseSet[]>;
  allExerciseNotes: Record<number, string>;
  completedExercises: number[];
  workoutStartTime: string; // ISO string for serialization
}

export const saveWorkoutState = async (state: WorkoutExecutionState): Promise<void> => {
  try {
    const serializedState = JSON.stringify(state);
    await AsyncStorage.setItem(WORKOUT_STATE_KEY, serializedState);
  } catch (error) {
    console.error('Error saving workout state:', error);
  }
};

export const loadWorkoutState = async (): Promise<WorkoutExecutionState | null> => {
  try {
    const serializedState = await AsyncStorage.getItem(WORKOUT_STATE_KEY);
    if (serializedState) {
      return JSON.parse(serializedState);
    }
    return null;
  } catch (error) {
    console.error('Error loading workout state:', error);
    return null;
  }
};

export const clearWorkoutState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(WORKOUT_STATE_KEY);
  } catch (error) {
    console.error('Error clearing workout state:', error);
  }
};

export const hasWorkoutInProgress = async (): Promise<boolean> => {
  try {
    const state = await loadWorkoutState();
    return state?.isInProgress || false;
  } catch (error) {
    console.error('Error checking workout state:', error);
    return false;
  }
};