import { gql } from '@apollo/client';

export const WORKOUT_HISTORY_FRAGMENT = gql`
  fragment WorkoutHistoryFragment on WorkoutHistoryType {
    id
    userId
    workoutId
    executedAt
    workoutName
    trainingDayName
    trainingDayOrder
    notes
    durationMinutes
    createdAt
    updatedAt
  }
`;

export const WORKOUT_HISTORY_EXERCISE_FRAGMENT = gql`
  fragment WorkoutHistoryExerciseFragment on WorkoutHistoryExerciseType {
    id
    workoutHistoryId
    exerciseId
    exerciseName
    order
    plannedSets
    completedSets
    notes
    createdAt
    updatedAt
  }
`;

export const WORKOUT_HISTORY_EXERCISE_SET_FRAGMENT = gql`
  fragment WorkoutHistoryExerciseSetFragment on WorkoutHistoryExerciseSetType {
    id
    workoutHistoryExerciseId
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
    createdAt
    updatedAt
  }
`;

export const GET_WORKOUT_HISTORIES = gql`
  ${WORKOUT_HISTORY_FRAGMENT}
  ${WORKOUT_HISTORY_EXERCISE_FRAGMENT}
  ${WORKOUT_HISTORY_EXERCISE_SET_FRAGMENT}
  
  query GetWorkoutHistories {
    workoutHistories {
      ...WorkoutHistoryFragment
      workoutHistoryExercises {
        ...WorkoutHistoryExerciseFragment
        workoutHistoryExerciseSets {
          ...WorkoutHistoryExerciseSetFragment
        }
      }
    }
  }
`;

export const GET_WORKOUT_HISTORIES_BY_USER = gql`
  ${WORKOUT_HISTORY_FRAGMENT}
  ${WORKOUT_HISTORY_EXERCISE_FRAGMENT}
  ${WORKOUT_HISTORY_EXERCISE_SET_FRAGMENT}
  
  query GetWorkoutHistoriesByUser($userId: ID!) {
    workoutHistoriesByUser(userId: $userId) {
      ...WorkoutHistoryFragment
      workoutHistoryExercises {
        ...WorkoutHistoryExerciseFragment
        workoutHistoryExerciseSets {
          ...WorkoutHistoryExerciseSetFragment
        }
      }
    }
  }
`;

export const GET_WORKOUT_HISTORIES_BY_WORKOUT = gql`
  ${WORKOUT_HISTORY_FRAGMENT}
  ${WORKOUT_HISTORY_EXERCISE_FRAGMENT}
  ${WORKOUT_HISTORY_EXERCISE_SET_FRAGMENT}
  
  query GetWorkoutHistoriesByWorkout($workoutId: ID!) {
    workoutHistoriesByWorkout(workoutId: $workoutId) {
      ...WorkoutHistoryFragment
      workoutHistoryExercises {
        ...WorkoutHistoryExerciseFragment
        workoutHistoryExerciseSets {
          ...WorkoutHistoryExerciseSetFragment
        }
      }
    }
  }
`;

export const GET_WORKOUT_HISTORY = gql`
  ${WORKOUT_HISTORY_FRAGMENT}
  ${WORKOUT_HISTORY_EXERCISE_FRAGMENT}
  ${WORKOUT_HISTORY_EXERCISE_SET_FRAGMENT}
  
  query GetWorkoutHistory($id: ID!) {
    workoutHistory(id: $id) {
      ...WorkoutHistoryFragment
      workoutHistoryExercises {
        ...WorkoutHistoryExerciseFragment
        workoutHistoryExerciseSets {
          ...WorkoutHistoryExerciseSetFragment
        }
      }
    }
  }
`;