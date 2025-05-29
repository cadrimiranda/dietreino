import { ref, computed } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { gql } from '@apollo/client/core';

const GET_EXERCISES = gql`
  query GetExercises {
    exercises {
      id
      name
      videoLink
    }
  }
`;

export function useExercises() {
  const { result, loading, error, refetch } = useQuery(GET_EXERCISES);

  const exercises = computed(() => result.value?.exercises || []);

  return {
    exercises,
    loading,
    error,
    refetch
  };
}