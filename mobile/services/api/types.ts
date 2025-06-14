// Import necessary types
import { LoginResponse, WorkoutType } from "../../generated/graphql";
import { WorkoutScheduleList } from "@/types/workout";

export interface WorkoutSchedule {
  [key: number]: string;
}

export interface ApiClient {
  login(email: string, password: string): Promise<LoginResponse>;
  refreshAccessToken(refreshToken: string): Promise<string>;
  getWorkoutSchedule(): Promise<WorkoutSchedule>;
  getWorkoutDetails(): Promise<WorkoutType>;
  getUserProfile(): Promise<any>;
  getWorkoutScheduleList(): Promise<WorkoutScheduleList>;
}

// Service container interface
export interface ServiceContainer {
  api: ApiClient;
}
