import { reactive, toRefs, watch, ToRefs, Ref } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { ApolloError } from "@apollo/client";

interface User {
  id: string;
  name: string;
  email: string;
  generatedPassword?: string;
  createdAt: string;
  updatedAt: string;
  phone?: string;
}

interface UserInput {
  name: string;
  email: string;
  phone?: string;
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: ApolloError | null;
}

interface UseUsersReturn extends ToRefs<UsersState> {
  refetch: () => Promise<any> | undefined; // Updated to allow undefined return
  addUser: (userData: UserInput) => Promise<User>;
  deleteUser: (id: string) => Promise<User>;
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
        generatedPassword
        createdAt
        updatedAt
        phone
      }
    }
  `;

  const CREATE_USER = gql`
    mutation CreateUserWithGeneratedPassword(
      $createUserInput: CreateUserWithPasswordInput!
    ) {
      createUserWithGeneratedPassword(createUserInput: $createUserInput) {
        id
        name
        email
        generatedPassword
        createdAt
        updatedAt
        phone
      }
    }
  `;

  const DELETE_USER = gql`
    mutation DeleteUser($id: ID!) {
      deleteUser(id: $id) {
        id
        name
      }
    }
  `;

  // Query for users
  const { result, loading, error, refetch } = useQuery<{ users: User[] }>(
    GET_USERS
  );

  // Watch the result and update our state
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

  interface CreateUserResponse {
    createUserWithGeneratedPassword: User;
  }

  interface CreateUserVariables {
    variables: {
      createUserInput: UserInput;
    };
  }

  // Create user mutation
  const { mutate: createUser, loading: createLoading } = useMutation<
    CreateUserResponse,
    CreateUserVariables
  >(CREATE_USER);

  interface DeleteUserResponse {
    deleteUser: User;
  }

  interface DeleteUserVariables {
    variables: {
      id: string;
    };
  }

  // Delete user mutation
  const { mutate: deleteUserMutation, loading: deleteLoading } = useMutation<
    DeleteUserResponse,
    DeleteUserVariables
  >(DELETE_USER);

  // Add a new user
  const addUser = async (userData: UserInput): Promise<User> => {
    try {
      const response = await createUser({
        variables: {
          createUserInput: userData,
        },
      });

      // Return the newly created user
      if (!response?.data) {
        throw new Error("Failed to create user");
      }

      return response.data.createUserWithGeneratedPassword;
    } catch (err) {
      state.error = err as ApolloError;
      throw err;
    }
  };

  // Delete a user by ID
  const deleteUser = async (id: string): Promise<User> => {
    try {
      const response = await deleteUserMutation({
        variables: { id },
      });

      // Optimistically update the local state
      state.users = state.users.filter((user) => user.id !== id);

      if (!response?.data) {
        throw new Error("Failed to delete user");
      }

      return response.data.deleteUser;
    } catch (err) {
      state.error = err as ApolloError;
      throw err;
    }
  };

  return {
    ...toRefs(state),
    refetch,
    addUser,
    deleteUser,
    createLoading,
    deleteLoading,
  };
}
