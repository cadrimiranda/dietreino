import { useQuery, gql } from "@apollo/client";

const GET_WORKOUT_HISTORIES_BY_USER = gql`
  query GetWorkoutHistoriesByUser($userId: ID!) {
    workoutHistoriesByUser(userId: $userId) {
      id
      userId
      workoutId
      executedAt
      workoutName
      trainingDayName
      trainingDayOrder
      notes
      durationMinutes
      workoutHistoryExercises {
        id
        exerciseId
        exerciseName
        order
        plannedSets
        completedSets
        notes
        workoutHistoryExerciseSets {
          id
          setNumber
          weight
          reps
          plannedRepsMin
          plannedRepsMax
          restSeconds
          isCompleted
          isFailure
          notes
          executedAt
        }
      }
    }
  }
`;

const GET_WORKOUT_HISTORY_SUMMARIES_BY_USER = gql`
  query GetWorkoutHistorySummariesByUser($userId: ID!) {
    workoutHistorySummariesByUser(userId: $userId) {
      id
      executedAt
      workoutName
      trainingDayName
      trainingDayOrder
      notes
      durationMinutes
    }
  }
`;

const GET_WORKOUT_HISTORIES_BY_USER_AND_DATE = gql`
  query GetWorkoutHistoriesByUserAndDate($userId: ID!, $date: DateTime!) {
    workoutHistoriesByUserAndDate(userId: $userId, date: $date) {
      id
      userId
      workoutId
      executedAt
      workoutName
      trainingDayName
      trainingDayOrder
      notes
      durationMinutes
      workoutHistoryExercises {
        id
        exerciseId
        exerciseName
        order
        plannedSets
        completedSets
        notes
        workoutHistoryExerciseSets {
          id
          setNumber
          weight
          reps
          plannedRepsMin
          plannedRepsMax
          restSeconds
          isCompleted
          isFailure
          notes
          executedAt
        }
      }
    }
  }
`;

const GET_WORKOUT_HISTORY_BY_ID = gql`
  query GetWorkoutHistoryById($id: ID!) {
    workoutHistory(id: $id) {
      id
      userId
      workoutId
      executedAt
      workoutName
      trainingDayName
      trainingDayOrder
      notes
      durationMinutes
      workoutHistoryExercises {
        id
        exerciseId
        exerciseName
        order
        plannedSets
        completedSets
        notes
        workoutHistoryExerciseSets {
          id
          setNumber
          weight
          reps
          plannedRepsMin
          plannedRepsMax
          restSeconds
          isCompleted
          isFailure
          notes
          executedAt
        }
      }
    }
  }
`;

const GET_WORKOUT_HISTORIES_BY_USER_AND_DATE_RANGE = gql`
  query GetWorkoutHistoriesByUserAndDateRange(
    $userId: ID!
    $startDate: DateTime!
    $endDate: DateTime!
  ) {
    workoutHistoriesByUserAndDateRange(
      userId: $userId
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      userId
      workoutId
      executedAt
      workoutName
      trainingDayName
      trainingDayOrder
      notes
      durationMinutes
      workoutHistoryExercises {
        id
        exerciseId
        exerciseName
        order
        plannedSets
        completedSets
        notes
        workoutHistoryExerciseSets {
          id
          setNumber
          weight
          reps
          plannedRepsMin
          plannedRepsMax
          restSeconds
          isCompleted
          isFailure
          notes
          executedAt
        }
      }
    }
  }
`;

export interface WorkoutHistoryQuerySet {
  id: string;
  setNumber: number;
  weight?: number;
  reps: number;
  plannedRepsMin?: number;
  plannedRepsMax?: number;
  restSeconds?: number;
  isCompleted: boolean;
  isFailure: boolean;
  notes?: string;
  executedAt: string;
}

export interface WorkoutHistoryQueryExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  plannedSets: number;
  completedSets: number;
  notes?: string;
  workoutHistoryExerciseSets: WorkoutHistoryQuerySet[];
}

export interface WorkoutHistoryQueryData {
  id: string;
  userId: string;
  workoutId: string;
  executedAt: string;
  workoutName: string;
  trainingDayName: string;
  trainingDayOrder: number;
  notes?: string;
  durationMinutes?: number;
  workoutHistoryExercises: WorkoutHistoryQueryExercise[];
}

export interface WorkoutHistorySummaryData {
  id: string;
  executedAt: string;
  workoutName: string;
  trainingDayName: string;
  trainingDayOrder: number;
  notes?: string;
  durationMinutes?: number;
}

export function useWorkoutHistoriesByUser(userId?: string) {
  return useQuery<{ workoutHistoriesByUser: WorkoutHistoryQueryData[] }>(
    GET_WORKOUT_HISTORIES_BY_USER,
    {
      variables: { userId },
      skip: !userId,
      errorPolicy: "all",
    }
  );
}

export function useWorkoutHistorySummariesByUser(userId?: string) {
  return useQuery<{
    workoutHistorySummariesByUser: WorkoutHistorySummaryData[];
  }>(GET_WORKOUT_HISTORY_SUMMARIES_BY_USER, {
    variables: { userId },
    skip: !userId,
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
  });
}

export function useWorkoutHistoryById(historyId?: string) {
  return useQuery<{ workoutHistory: WorkoutHistoryQueryData }>(
    GET_WORKOUT_HISTORY_BY_ID,
    {
      variables: { id: historyId },
      skip: !historyId,
      errorPolicy: "all",
      fetchPolicy: "cache-first",
    }
  );
}

export function useWorkoutHistoriesByUserAndDate(userId?: string, date?: Date) {
  return useQuery<{ workoutHistoriesByUserAndDate: WorkoutHistoryQueryData[] }>(
    GET_WORKOUT_HISTORIES_BY_USER_AND_DATE,
    {
      variables: {
        userId,
        date: date
          ? new Date(
              date.getUTCFullYear(),
              date.getUTCMonth(),
              date.getUTCDate(),
              12,
              0,
              0
            ).toISOString()
          : undefined,
      },
      skip: !userId || !date,
      errorPolicy: "all",
      fetchPolicy: "cache-and-network", // Always try to fetch fresh data
    }
  );
}

export function useWorkoutHistoriesByUserAndDateRange(
  userId?: string,
  startDate?: Date,
  endDate?: Date
) {
  return useQuery<{
    workoutHistoriesByUserAndDateRange: WorkoutHistoryQueryData[];
  }>(GET_WORKOUT_HISTORIES_BY_USER_AND_DATE_RANGE, {
    variables: {
      userId,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    },
    skip: !userId || !startDate || !endDate,
    errorPolicy: "all",
  });
}
