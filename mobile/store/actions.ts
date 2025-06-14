import { TActions, TState, UserData } from "./types";
import { StoreApi } from "zustand";
import { WorkoutScheduleList } from "@/types/workout";
import { WorkoutDayType } from "@/constants/workoutTypes";

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
    setSelectedWorkout: (workout: WorkoutDayType | null) => {
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
