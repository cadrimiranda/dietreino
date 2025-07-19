export interface WorkoutHistoryType {
  id: string;
  userId: string;
  workoutId: string;
  executedAt: string;
  workoutName: string;
  trainingDayName: string;
  trainingDayOrder: number;
  notes?: string;
  durationMinutes?: number;
  workoutHistoryExercises: WorkoutHistoryExerciseType[];
  createdAt: string;
  updatedAt?: string;
}

export interface WorkoutHistoryExerciseType {
  id: string;
  workoutHistoryId: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  plannedSets: number;
  completedSets: number;
  notes?: string;
  workoutHistoryExerciseSets: WorkoutHistoryExerciseSetType[];
  createdAt: string;
  updatedAt?: string;
}

export interface WorkoutHistoryExerciseSetType {
  id: string;
  workoutHistoryExerciseId: string;
  setNumber: number;
  weight?: number;
  reps: number;
  plannedRepsMin?: number;
  plannedRepsMax?: number;
  restSeconds?: number;
  isCompleted: boolean;
  isFailure: boolean;
  notes?: string;
  executedAt: string;
  createdAt: string;
  updatedAt?: string;
}

// Data for visualization components
export interface ExerciseProgressData {
  exerciseId: string;
  exerciseName: string;
  sessions: ExerciseSessionData[];
}

export interface ExerciseSessionData {
  date: string;
  workoutName: string;
  sets: SetProgressData[];
  maxWeight: number;
  totalVolume: number;
  averageReps: number;
}

export interface SetProgressData {
  setNumber: number;
  weight?: number;
  reps: number;
  isCompleted: boolean;
  volume: number; // weight * reps
}

// Filter and analytics types
export interface WorkoutHistoryFilters {
  userId?: string;
  workoutId?: string;
  exerciseId?: string;
  exerciseName?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface ExerciseAnalytics {
  exerciseId: string;
  exerciseName: string;
  totalSessions: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  averageWeight: number;
  maxWeight: number;
  averageReps: number;
  progressTrend: 'increasing' | 'decreasing' | 'stable';
  lastSession?: ExerciseSessionData;
  bestSession?: ExerciseSessionData;
}

export interface WorkoutAnalytics {
  totalWorkouts: number;
  totalDuration: number;
  averageDuration: number;
  exerciseAnalytics: ExerciseAnalytics[];
  weeklyFrequency: number;
  lastWorkout?: WorkoutHistoryType;
  bestWorkout?: WorkoutHistoryType;
}