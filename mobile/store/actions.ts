import { TActions, TState, UserData } from "./types";
import { StoreApi } from "zustand";
import { WorkoutScheduleList, WorkoutType } from "@/types/workout";

type TStoreApi = StoreApi<TState & TActions>;

const createActions = (
  set: TStoreApi["setState"],
  get: TStoreApi["getState"],
  ...args: any[]
) => {
  return {
    setIsWorkoutStarted: (value: boolean) => {
      set({ isWorkoutStarted: value });
    },
    setSelectedWorkout: (workout: WorkoutType | null) => {
      set({ selectedWorkout: workout });
    },
    setWorkoutScheduleList: (scheduleList: WorkoutScheduleList | null) => {
      set({ workoutScheduleList: scheduleList });
    },
    setUserData: (data: UserData | null) => {
      set({ userData: data });
    },
  };
};

export default createActions;
