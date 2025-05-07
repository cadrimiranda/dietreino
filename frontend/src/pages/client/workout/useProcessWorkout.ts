import {
  MutationImportXlsxAndCreateWorkoutArgs,
  WorkoutType,
} from "@/generated/graphql";
import { useMutation } from "@vue/apollo-composable";
import gql from "graphql-tag";

export function useProcessWorkout() {
  const EXTRACT_WORKOUT = gql`
    mutation importXlsxAndCreateWorkout($input: ImportXlsxUserWorkoutInput!) {
      importXlsxAndCreateWorkout(input: $input) {
        id
        isActive
        name
        userId
        weekEnd
        weekStart
        trainingDays {
          id
        }
      }
    }
  `;

  const { mutate, loading } = useMutation<
    WorkoutType,
    MutationImportXlsxAndCreateWorkoutArgs
  >(EXTRACT_WORKOUT);

  const processWorkout = async (
    input: MutationImportXlsxAndCreateWorkoutArgs
  ) => {
    try {
      const data = await mutate(input, {
        context: {
          hasUpload: true,
        },
      });
      return data?.data || [];
    } catch (error) {
      console.error("Error processing workout:", error);
      throw error;
    }
  };

  return {
    processWorkout,
    loading,
  };
}
