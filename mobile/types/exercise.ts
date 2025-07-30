import type { WorkoutType } from "./workout";

export interface Series {
  reps: number;
  weight?: number;
  completed?: number;
  weightLeft?: number;
  repsLeft?: number;
  weightRight?: number;
  repsRight?: number;
  isBilateral?: boolean;
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
  isBilateral?: boolean; // Definido pelo treinador na prescrição
}

export interface WorkoutDetails {
  type: WorkoutType;
  exercises: Exercise[];
}
