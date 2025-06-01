import { gql } from '@apollo/client/core';

export const UPDATE_WORKOUT_EXERCISES = gql`
  mutation UpdateWorkoutExercises($input: UpdateWorkoutExercisesInput!) {
    updateWorkoutExercises(input: $input) {
      id
      name
      weekStart
      weekEnd
      isActive
      trainingDays {
        id
        name
        order
        dayOfWeek
        trainingDayExercises {
          id
          order
          exercise {
            id
            name
            videoLink
          }
          repSchemes {
            id
            sets
            minReps
            maxReps
          }
          restIntervals {
            id
            intervalTime
            order
          }
        }
      }
    }
  }
`;

export const TOGGLE_WORKOUT_ACTIVE = gql`
  mutation ToggleWorkoutActive($input: ToggleWorkoutActiveInput!) {
    toggleWorkoutActive(input: $input) {
      id
      isActive
    }
  }
`;

export const ACTIVATE_WORKOUT = gql`
  mutation ActivateWorkout($id: ID!) {
    activateWorkout(id: $id) {
      id
      isActive
    }
  }
`;

export const DEACTIVATE_WORKOUT = gql`
  mutation DeactivateWorkout($id: ID!) {
    deactivateWorkout(id: $id) {
      id
      isActive
    }
  }
`;

export const CREATE_WORKOUT = gql`
  mutation CreateWorkout($input: CreateWorkoutInput!) {
    createWorkout(input: $input) {
      id
      name
      weekStart
      weekEnd
      isActive
      trainingDays {
        id
        name
        order
        dayOfWeek
        trainingDayExercises {
          id
          order
          exercise {
            id
            name
            videoLink
          }
          repSchemes {
            id
            sets
            minReps
            maxReps
          }
          restIntervals {
            id
            intervalTime
            order
          }
        }
      }
    }
  }
`;