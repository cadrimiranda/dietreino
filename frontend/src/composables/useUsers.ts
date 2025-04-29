import { reactive, toRefs, watch, ToRefs, Ref } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
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

interface UsersState {
  users: IUserEntity[];
  loading: boolean;
  error: ApolloError | null;
}

interface UseUsersReturn extends ToRefs<UsersState> {
  refetch: () => Promise<any> | undefined; // Updated to allow undefined return
  upsertUser: (userData: UserInput) => Promise<IUserEntity>;
  deleteUser: (id: string) => Promise<boolean>;
  createLoading: Ref<boolean>;
  deleteLoading: Ref<boolean>;
}

export function useUsers(): UseUsersReturn {
  const state = reactive<UsersState>({
    users: [],
    loading: true,
    error: null,
  });

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

  const { result, loading, error, refetch } = useQuery<{
    users: IUserEntity[];
  }>(GET_USERS);

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

  // Create user mutation
  const { mutate: upsertMutation, loading: createLoading } =
    useMutation(UPSERT_USER);

  // Delete user mutation
  const { mutate: deleteUserMutation, loading: deleteLoading } =
    useMutation(DELETE_USER);

  // Add a new user
  const upsertUser = async (userData: UserInput): Promise<IUserEntity> => {
    try {
      const response = await upsertMutation({ userInput: userData });

      // Return the newly created user
      if (!response?.data) {
        throw new Error("Failed to create user");
      }

      return response.data.upsertUser;
    } catch (err) {
      state.error = err as ApolloError;
      throw err;
    }
  };

  // Delete a user by ID
  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      const response = await deleteUserMutation({
        id,
      });

      // Optimistically update the local state
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

  return {
    ...toRefs(state),
    refetch,
    upsertUser,
    deleteUser,
    createLoading,
    deleteLoading,
  };
}
