// Re-export GraphQL types for backward compatibility
export type {
  WorkoutType,
  TrainingDay,
  TrainingDayExercise,
  CreateWorkoutInput,
  UpdateWorkoutInput,
  ToggleWorkoutActiveInput
} from "../generated/graphql";

import type { WorkoutDayType } from "@/constants/workoutTypes";

// Custom mobile-specific types
export interface WorkoutScheduleItem {
  day: number;
  workout: WorkoutDayType;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    rest: string;
  }>;
}

export type WorkoutScheduleList = WorkoutScheduleItem[];
