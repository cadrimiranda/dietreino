import {
  MutationExtractWorkoutSheetArgs,
  SheetExercises,
} from "@/generated/graphql";
import { useMutation } from "@vue/apollo-composable";
import gql from "graphql-tag";

export function useProcessWorkout() {
  const EXTRACT_WORKOUT = gql`
    mutation extractWorkoutSheet($file: Upload!) {
      extractWorkoutSheet(file: $file) {
        sheetName
        exercises {
          name
          rawReps
          repSchemes {
            minReps
            maxReps
            sets
          }
          restIntervals
        }
      }
    }
  `;

  const { mutate, loading } = useMutation<
    Array<SheetExercises>,
    MutationExtractWorkoutSheetArgs
  >(EXTRACT_WORKOUT);

  const processWorkout = async (file: File) => {
    try {
      const data = await mutate(
        {
          file,
        },
        {
          context: {
            hasUpload: true,
          },
        }
      );
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
