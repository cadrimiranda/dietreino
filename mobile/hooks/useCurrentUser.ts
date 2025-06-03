import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { UserType } from '@/generated/graphql';
import { AuthStorage } from '@/utils/auth';
import { useEffect, useState } from 'react';

const GET_CURRENT_USER = gql`
  query GetCurrentUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      phone
      role
      createdAt
      updatedAt
      nutritionist {
        id
        name
        email
      }
      trainer {
        id
        name
        email
      }
      workouts {
        id
        name
        weekStart
        weekEnd
        isActive
        startedAt
        trainingDaysBitfield
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
  }
`;

interface UseCurrentUserReturn {
  user: UserType | undefined;
  loading: boolean;
  error: any;
  refetch: () => Promise<any>;
  activeWorkout: UserType['workouts'][0] | undefined;
}

export function useCurrentUser(): UseCurrentUserReturn {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserId = async () => {
      const userData = await AuthStorage.getUserData();
      if (userData?.id) {
        setUserId(userData.id);
      }
    };
    loadUserId();
  }, []);
  
  const { data, loading, error, refetch } = useQuery<{ user: UserType }>(
    GET_CURRENT_USER,
    {
      variables: { id: userId! },
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
      skip: !userId,
    }
  );

  const user = data?.user;
  const activeWorkout = user?.workouts?.find(workout => workout.isActive);

  return {
    user,
    loading,
    error,
    refetch,
    activeWorkout,
  };
}