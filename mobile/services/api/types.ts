// Import necessary types
import { LoginResponse } from "../../generated/graphql";
import { WorkoutDetails } from "@/types/exercise";
import { WorkoutScheduleList } from "@/types/workout";
import { WorkoutSchedule as WS } from "./mock";

export interface ApiClient {
  login(email: string, password: string): Promise<LoginResponse>;
  refreshAccessToken(refreshToken: string): Promise<string>;
  getWorkoutSchedule(): Promise<WS>;
  getWorkoutDetails(): Promise<WorkoutDetails>;
  getUserProfile(): Promise<any>;
  getWorkoutScheduleList(): Promise<WorkoutScheduleList>; // Novo método
}

// Service container interface
export interface ServiceContainer {
  api: ApiClient;
}
