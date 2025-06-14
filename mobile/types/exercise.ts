// Re-export GraphQL types
export type {
  WorkoutType,
  Exercise as GraphQLExercise,
  TrainingDay,
  TrainingDayExercise,
  RepScheme,
  RestInterval,
  UserType,
  ExerciseType
} from "../generated/graphql";

// UI-specific types
export interface Series {
  reps: number;
  weight?: number;
  completed?: number;
}

export interface Set {
  weight: number;
  reps: number;
}

export interface HistoryEntry {
  date: string;
  sets: Set[];
}

// Extended Exercise interface for UI compatibility
export interface Exercise {
  id: string;
  name: string;
  videoLink?: string;
  youtubeUrl?: string;
  restTime?: number[];
  series?: number;
  repsPerSeries?: number;
  trainerNotes?: string;
  userNotes?: string;
  completedSeries?: Series[];
  history?: HistoryEntry[];
  isCompleted?: boolean;
  order?: number;
}
