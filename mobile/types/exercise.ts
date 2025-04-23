import type { WorkoutType } from "./workout";

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

export interface Exercise {
  id: string;
  name: string;
  youtubeUrl: string;
  restTime: number[];
  trainerNotes: string;
  series: number;
  repsPerSeries: number;
  userNotes?: string;
  completedSeries?: Series[];
  history?: HistoryEntry[];
  isCompleted?: boolean;
}

export interface WorkoutDetails {
  type: WorkoutType;
  exercises: Exercise[];
}
