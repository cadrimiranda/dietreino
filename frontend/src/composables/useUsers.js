import { reactive, toRefs, watch } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import gql from "graphql-tag";

export function useUsers() {
  const state = reactive({
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
  const { result, loading, error, refetch } = useQuery(GET_USERS);

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

  // Create user mutation
  const { mutate: createUser, loading: createLoading } =
    useMutation(CREATE_USER);

  // Delete user mutation
  const { mutate: deleteUserMutation, loading: deleteLoading } =
    useMutation(DELETE_USER);

  // Add a new user
  const addUser = async (userData) => {
    try {
      const response = await createUser({
        variables: {
          createUserInput: userData,
        },
      });

      // Return the newly created user
      return response.data.createUserWithGeneratedPassword;
    } catch (err) {
      state.error = err;
      throw err;
    }
  };

  // Delete a user by ID
  const deleteUser = async (id) => {
    try {
      const response = await deleteUserMutation({
        variables: { id },
      });

      // Optimistically update the local state
      state.users = state.users.filter((user) => user.id !== id);

      return response.data.deleteUser;
    } catch (err) {
      state.error = err;
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
