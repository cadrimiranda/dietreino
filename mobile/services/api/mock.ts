import { ApiClient, LoginResponse, TokenPayload } from "./types";

import { fromByteArray } from "base64-js";
import { WorkoutScheduleList, WorkoutType } from "../../types/workout";
import { WorkoutDetails } from "@/types/exercise";

// Helper to create JWT (this is just for mock purposes)
const createMockJWT = (payload: TokenPayload): string => {
  const str = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(str);
  const base64Payload = fromByteArray(bytes);
  return `mock.${base64Payload}.signature`;
};

export interface WorkoutSchedule {
  [key: number]: WorkoutType;
}

export class MockApiClient implements ApiClient {
  private workoutSchedule: WorkoutSchedule = {
    1: WorkoutType.BACK, // Segunda
    2: WorkoutType.SHOULDER, // Terça
    3: WorkoutType.LEGS, // Quarta
    4: WorkoutType.CHEST, // Quinta
    5: WorkoutType.ARMS, // Sexta
    6: WorkoutType.REST, // Sábado
    0: WorkoutType.REST, // Domingo
  };

  private workoutScheduleList: WorkoutScheduleList = [
    {
      day: "Segunda",
      workout: WorkoutType.CHEST,
      exercises: ["Supino", "Flexão", "Crucifixo"],
    },
    {
      day: "Terça",
      workout: WorkoutType.ARMS,
      exercises: ["Rosca Direta", "Tríceps Testa", "Martelo"],
    },
    {
      day: "Quarta",
      workout: WorkoutType.LEGS,
      exercises: ["Agachamento", "Leg Press", "Panturrilha"],
    },
    {
      day: "Quinta",
      workout: WorkoutType.BACK,
      exercises: ["Barra Fixa", "Remada", "Puxada Frontal"],
    },
    {
      day: "Sexta",
      workout: WorkoutType.SHOULDER,
      exercises: ["Desenvolvimento", "Elevação Lateral", "Encolhimento"],
    },
    { day: "Sábado", workout: WorkoutType.REST, exercises: [] },
    { day: "Domingo", workout: WorkoutType.REST, exercises: [] },
  ];

  async getWorkoutScheduleList(): Promise<WorkoutScheduleList> {
    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.workoutScheduleList;
  }

  async getWorkoutDetails(): Promise<WorkoutDetails> {
    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      type: WorkoutType.CHEST,
      exercises: [
        {
          id: "1",
          name: "Supino Reto com Barra",
          youtubeUrl: "https://www.youtube.com/watch?v=example1",
          trainerNotes:
            "Mantenha os cotovelos alinhados durante o movimento. Aumente o peso gradualmente.",
          series: 6,
          repsPerSeries: 12,
          restTime: [60, 90],
          // Exemplo de séries já completadas
          completedSeries: [
            { reps: 12, weight: 60 },
            { reps: 12, weight: 60 },
            { reps: 10, weight: 60 },
            { reps: 10, weight: 55 },
            { reps: 8, weight: 55 },
            { reps: 8, weight: 50 },
          ],
          userNotes:
            "Senti o ombro direito um pouco desconfortável na última série",

          history: [
            {
              date: "2023-10-01",
              sets: [
                { weight: 20, reps: 12 },
                { weight: 20, reps: 12 },
              ],
            },
            {
              date: "2025-04-01",
              sets: [
                { weight: 60, reps: 12 },
                { weight: 60, reps: 12 },
              ],
            },
            {
              date: "2025-03-28",
              sets: [
                { weight: 57.5, reps: 12 },
                { weight: 57.5, reps: 12 },
              ],
            },
            {
              date: "2025-03-28",
              sets: [
                { weight: 57.5, reps: 12 },
                { weight: 57.5, reps: 12 },
              ],
            },
            {
              date: "2025-03-28",
              sets: [
                { weight: 57.5, reps: 12 },
                { weight: 57.5, reps: 12 },
              ],
            },
            {
              date: "2025-03-28",
              sets: [
                { weight: 57.5, reps: 12 },
                { weight: 57.5, reps: 12 },
              ],
            },
            {
              date: "2025-03-28",
              sets: [
                { weight: 57.5, reps: 12 },
                { weight: 57.5, reps: 12 },
              ],
            },
            {
              date: "2025-03-28",
              sets: [
                { weight: 57.5, reps: 12 },
                { weight: 57.5, reps: 12 },
              ],
            },
            {
              date: "2025-03-28",
              sets: [
                { weight: 57.5, reps: 12 },
                { weight: 57.5, reps: 12 },
              ],
            },
          ],
        },
        {
          id: "2",
          name: "Supino Inclinado com Halter",
          youtubeUrl: "https://www.youtube.com/watch?v=example2",
          trainerNotes:
            "Foco na contração do peitoral superior. Descer os halteres de forma controlada.",
          series: 4,
          repsPerSeries: 15,
          restTime: [60],
          completedSeries: [
            { reps: 15, weight: 22 },
            { reps: 15, weight: 22 },
            { reps: 12, weight: 22 },
            { reps: 12, weight: 20 },
          ],
        },
        {
          id: "3",
          name: "Crossover",
          youtubeUrl: "https://www.youtube.com/watch?v=example3",
          trainerNotes:
            "Manter a tensão constante no peitoral. Fazer uma pausa de 1s na contração.",
          series: 3,
          repsPerSeries: 15,
          restTime: [60],
          completedSeries: [
            { reps: 15, weight: 15 },
            { reps: 15, weight: 15 },
            { reps: 12, weight: 12.5 },
          ],
        },
      ],
    };
  }

  async getWorkoutSchedule(): Promise<WorkoutSchedule> {
    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.workoutSchedule;
  }

  generateExpirationDate(): number {
    return Math.floor(Date.now() / 1000) + 3 * 60 * 60;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create tokens with expiration in 3 hours
    const expirationDate = this.generateExpirationDate();

    const accessToken = createMockJWT({
      userId: "123",
      email,
      expirationDate,
    });

    const refreshToken = createMockJWT({
      userId: "123",
      email,
      expirationDate: expirationDate + 24 * 60 * 60, // Refresh token valid for 24 hours more
    });

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Create new access token with expiration in 3 hours
    const expirationDate = this.generateExpirationDate();

    const newAccessToken = createMockJWT({
      userId: "123",
      email: "user@example.com",
      expirationDate,
    });

    return newAccessToken;
  }

  async getUserProfile(): Promise<any> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      id: "123",
      email: "user@example.com",
      name: "Test User",
    };
  }
}
