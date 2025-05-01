import { reactive, toRefs, watch, ToRefs, Ref } from "vue";
import { useQuery, useMutation, useLazyQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { ApolloError } from "@apollo/client";

export interface ICommonClientData {
  id: number | string;
  name: string;
  email: string;
  phone: string;
}

export interface IUserEntity extends ICommonClientData {
  generatedPassword?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserInput {
  name: string;
  email: string;
  phone?: string;
}

interface RepRange {
  minReps: number;
  maxReps: number;
  sets: number;
}

interface ExerciseInfo {
  name: string;
  rawReps: string;
  repSchemes: RepRange[];
  restIntervals: string;
}

interface SheetExercises {
  sheetName: string;
  exercises: ExerciseInfo[];
}

interface ImportSheetWorkoutInput {
  userId: string;
  workoutName: string;
  sheetName: string;
  weekStart: number;
  weekEnd: number;
  isActive: boolean;
  exercises: {
    name: string;
    rawReps: string;
    repSchemes: RepRange[];
    restIntervals: string[];
  }[];
}

interface WorkoutType {
  id: string;
  name: string;
  userId: string;
  weekStart: number;
  weekEnd: number;
  isActive: boolean;
  createdAt: string;
}

interface UsersState {
  users: IUserEntity[];
  loading: boolean;
  error: ApolloError | null;
}

interface UseUsersReturn extends ToRefs<UsersState> {
  refetch: () => Promise<any> | undefined;
  upsertUser: (userData: UserInput) => Promise<IUserEntity>;
  deleteUser: (id: string) => Promise<boolean>;
  extractWorkoutSheet: (file: File) => Promise<SheetExercises[]>;
  importSheetWorkout: (input: ImportSheetWorkoutInput) => Promise<WorkoutType>;
  createLoading: Ref<boolean>;
  deleteLoading: Ref<boolean>;
  userLoading: Ref<boolean>;
  extractSheetLoading: Ref<boolean>;
  importSheetLoading: Ref<boolean>;
  user: Ref<{ user: IUserEntity } | undefined>;
  resetState: () => void;
}

export function useUsers({ userId }: { userId?: string }): UseUsersReturn {
  const state = reactive<UsersState>({
    users: [],
    loading: true,
    error: null,
  });

  const GET_USER = gql`
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        email
        createdAt
        updatedAt
        nutritionist {
          id
          name
        }
        trainer {
          id
          name
        }
        workouts {
          id
          name
          workoutExercises {
            id
            exercise {
              id
              name
              video_link
            }
            repSchemes {
              id
              sets
              min_reps
              max_reps
            }
            restIntervals {
              id
              interval_time
              order
            }
        }
      }
    }
  `;

  const GET_USERS = gql`
    query GetUsers {
      users {
        id
        name
        email
        createdAt
        updatedAt
        phone
      }
    }
  `;

  const UPSERT_USER = gql`
    mutation upsertUser($userInput: UserInput!) {
      upsertUser(userInput: $userInput) {
        id
        email
        name
        phone
        createdAt
        generatedPassword
      }
    }
  `;

  const DELETE_USER = gql`
    mutation DeleteUser($id: ID!) {
      deleteUser(id: $id)
    }
  `;

  const EXTRACT_WORKOUT_SHEET = gql`
    mutation ExtractWorkoutSheet($file: Upload!) {
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

  const IMPORT_SHEET_WORKOUT = gql`
    mutation ImportSheetWorkout($input: ImportSheetWorkoutInput!) {
      importSheetWorkout(input: $input) {
        id
        name
        userId
        weekStart
        weekEnd
        isActive
        createdAt
      }
    }
  `;

  const { result, loading, error, refetch } = useQuery<{
    users: IUserEntity[];
  }>(GET_USERS, null, { enabled: !userId, fetchPolicy: "network-only" });

  watch(result, (newResult) => {
    if (newResult) {
      state.users = newResult.users;
    }
  });

  watch(loading, (newLoading) => {
    state.loading = newLoading;
  });

  watch(error, (newError) => {
    state.error = newError;
  });

  const { loading: userLoading, result: user } = useQuery<
    {
      user: IUserEntity;
    },
    { id: string }
  >(GET_USER, { id: userId as string }, { enabled: !!userId });

  const { mutate: upsertMutation, loading: createLoading } =
    useMutation(UPSERT_USER);

  const { mutate: deleteUserMutation, loading: deleteLoading } =
    useMutation(DELETE_USER);

  const { mutate: extractWorkoutSheetMutation, loading: extractSheetLoading } =
    useMutation(EXTRACT_WORKOUT_SHEET);

  const { mutate: importSheetWorkoutMutation, loading: importSheetLoading } =
    useMutation(IMPORT_SHEET_WORKOUT);

  const upsertUser = async (userData: UserInput): Promise<IUserEntity> => {
    try {
      const response = await upsertMutation({ userInput: userData });

      if (!response?.data) {
        throw new Error("Failed to create user");
      }

      return response.data.upsertUser;
    } catch (err) {
      state.error = err as ApolloError;
      throw err;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      const response = await deleteUserMutation({
        id,
      });

      state.users = state.users.filter((user) => user.id !== id);

      if (!response?.data) {
        throw new Error("Failed to delete user");
      }
    } catch (err) {
      state.error = err as ApolloError;
      throw err;
    }

    return Promise.resolve(true);
  };

  const extractWorkoutSheet = async (file: File): Promise<SheetExercises[]> => {
    try {
      const response = await extractWorkoutSheetMutation({
        file,
      });

      if (!response?.data) {
        throw new Error("Failed to extract workout sheet");
      }

      return response.data.extractWorkoutSheet;
    } catch (err) {
      state.error = err as ApolloError;
      throw err;
    }
  };

  const importSheetWorkout = async (
    input: ImportSheetWorkoutInput
  ): Promise<WorkoutType> => {
    try {
      const response = await importSheetWorkoutMutation({
        input,
      });

      if (!response?.data) {
        throw new Error("Failed to import workout sheet");
      }

      return response.data.importSheetWorkout;
    } catch (err) {
      state.error = err as ApolloError;
      throw err;
    }
  };

  const resetState = () => {
    state.loading = true;
    state.error = null;
    refetch?.();
  };

  return {
    ...toRefs(state),
    refetch,
    upsertUser,
    deleteUser,
    extractWorkoutSheet,
    importSheetWorkout,
    createLoading,
    deleteLoading,
    extractSheetLoading,
    importSheetLoading,
    userLoading,
    user,
    resetState,
  };
}
