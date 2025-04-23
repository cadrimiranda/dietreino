export enum WorkoutType {
  BACK = "Costas",
  SHOULDER = "Ombro",
  LEGS = "Pernas",
  CHEST = "Peito",
  ARMS = "Braços",
  REST = "Descanso",
}

export interface WorkoutScheduleItem {
  day: string;
  workout: WorkoutType;
  exercises: string[];
}

export type WorkoutScheduleList = WorkoutScheduleItem[];
