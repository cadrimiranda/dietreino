import type { WorkoutType, WorkoutScheduleList } from "@/types/workout";

export interface UserData {
  id: string;
  name: string;
  email: string;
}

type TState = {
  workoutStartedType: WorkoutType | null;
  isWorkoutStarted: boolean;
  selectedWorkout: WorkoutType | null;
  workoutScheduleList: WorkoutScheduleList | null;
  userData: UserData | null;
};

type TActions = {
  setIsWorkoutStarted: (value: boolean) => void;
  setSelectedWorkout: (workout: WorkoutType | null) => void;
  setWorkoutScheduleList: (scheduleList: WorkoutScheduleList | null) => void; // Nova ação
  setUserData: (data: UserData | null) => void;
};

type TStore = TState & TActions;

export type { TStore, TState, TActions };
