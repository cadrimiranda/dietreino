import type { WorkoutScheduleList } from "@/types/workout";
import type { WorkoutDayType } from "@/constants/workoutTypes";
import type { UserType } from "../generated/graphql";

// Use the generated UserType instead of custom UserData
export type UserData = UserType;

type TState = {
  workoutStartedType: WorkoutDayType | null;
  isWorkoutStarted: boolean;
  selectedWorkout: WorkoutDayType | null;
  workoutScheduleList: WorkoutScheduleList | null;
  userData: UserData | null;
};

type TActions = {
  setIsWorkoutStarted: (value: boolean) => void;
  setSelectedWorkout: (workout: WorkoutDayType | null) => void;
  setWorkoutScheduleList: (scheduleList: WorkoutScheduleList | null) => void; // Nova ação
  setUserData: (data: UserData | null) => void;
};

type TStore = TState & TActions;

export type { TStore, TState, TActions };
