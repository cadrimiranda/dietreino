import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { ApolloLink, ApolloClient, Observable } from "@apollo/client/core";

import gql from "graphql-tag";
import { useApolloClient } from "@vue/apollo-composable";
import { message } from "ant-design-vue";

import {
  LocalStorageTokenService,
  TokenValidator,
} from "../security/authStorage";
import {
  LoginResponse,
  MutationLoginArgs,
  MutationRefreshTokenArgs,
} from "@/generated/graphql";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RefreshTokenInput {
  refreshToken: string;
}

interface RefreshState {
  inProgress: boolean;
  queue: Array<(token: string | null) => void>;
}

const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
      refreshToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshTokenInput: RefreshTokenInput!) {
    refreshToken(refreshTokenInput: $refreshTokenInput) {
      accessToken
      refreshToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

const tokenStorage = new LocalStorageTokenService();
const tokenValidator = new TokenValidator();

const accessToken = ref<string>(tokenStorage.getAccessToken() || "");
const refreshToken = ref<string>(tokenStorage.getRefreshToken() || "");
const currentUser = ref<User | null>(tokenStorage.getUser());
const loading = ref<boolean>(false);
const error = ref<string>("");
const isAuthenticated = computed(() => {
  const hasValidAccessToken = tokenValidator.isTokenValid(accessToken.value);
  const hasValidRefreshToken = tokenValidator.isRefreshTokenValid(refreshToken.value);
  return hasValidAccessToken || hasValidRefreshToken;
});

const refreshState = reactive<RefreshState>({
  inProgress: false,
  queue: [],
});

let sessionExpiredHandled = false;
let globalListenerAdded = false;

async function refreshAccessToken(
  apolloClient: ApolloClient<any>
): Promise<boolean> {
  if (refreshState.inProgress) {
    return new Promise((resolve) => {
      refreshState.queue.push((success) => {
        resolve(!!success);
      });
    });
  }

  refreshState.inProgress = true;

  try {
    const { data } = await apolloClient.mutate<
      { refreshToken: LoginResponse },
      MutationRefreshTokenArgs
    >({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: {
        refreshTokenInput: { refreshToken: refreshToken.value },
      },
      context: { skipAuth: true },
    });

    const result = data?.refreshToken;
    if (result?.accessToken && result?.refreshToken) {
      accessToken.value = result.accessToken;
      refreshToken.value = result.refreshToken;
      tokenStorage.setAccessToken(result.accessToken);
      tokenStorage.setRefreshToken(result.refreshToken);

      if (result.user) {
        currentUser.value = result.user;
        tokenStorage.setUser(result.user);
      }

      sessionExpiredHandled = false;
      refreshState.queue.forEach((callback) => callback(accessToken.value));
      refreshState.queue = [];
      refreshState.inProgress = false;
      return true;
    }

    throw new Error("Failed to refresh token");
  } catch (err) {
    console.error("Failed to refresh token:", err);
    accessToken.value = "";
    refreshToken.value = "";
    currentUser.value = null;
    tokenStorage.clearTokens();

    refreshState.queue.forEach((callback) => callback(null));
    refreshState.queue = [];
    refreshState.inProgress = false;

    if (!sessionExpiredHandled) {
      sessionExpiredHandled = true;
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }
    return false;
  }
}

// Create auth link factory function instead of exporting the link directly
export function createAuthLink(apolloClient: ApolloClient<any>): ApolloLink {
  return new ApolloLink((operation, forward) => {
    if (operation.getContext().skipAuth) {
      return forward(operation);
    }

    return new Observable((observer) => {
      let handle: any;
      let isRefreshing = false;

      Promise.resolve().then(async () => {
        try {
          const currentToken = accessToken.value;
          const currentRefreshToken = refreshToken.value;
          
          if (!tokenValidator.isTokenValid(currentToken)) {
            if (tokenValidator.isRefreshTokenValid(currentRefreshToken)) {
              isRefreshing = true;
              const success = await refreshAccessToken(apolloClient);
              isRefreshing = false;

              if (!success) {
                if (!sessionExpiredHandled) {
                  sessionExpiredHandled = true;
                  window.dispatchEvent(new CustomEvent("auth:session-expired"));
                }
                observer.error(new Error("Session expired"));
                return;
              }
            } else {
              if (!sessionExpiredHandled) {
                sessionExpiredHandled = true;
                window.dispatchEvent(new CustomEvent("auth:session-expired"));
              }
              observer.error(new Error("No valid authentication"));
              return;
            }
          }

          if (accessToken.value) {
            operation.setContext(({ headers = {} }) => ({
              headers: {
                ...headers,
                Authorization: `Bearer ${accessToken.value}`,
              },
            }));
          }

          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: (error) => {
              if (
                error.networkError?.statusCode === 401 &&
                tokenValidator.isRefreshTokenValid(refreshToken.value) &&
                !isRefreshing
              ) {
                isRefreshing = true;
                refreshAccessToken(apolloClient).then((success) => {
                  isRefreshing = false;
                  if (success) {
                    operation.setContext(({ headers = {} }) => ({
                      headers: {
                        ...headers,
                        Authorization: `Bearer ${accessToken.value}`,
                      },
                    }));

                    forward(operation).subscribe({
                      next: observer.next.bind(observer),
                      error: observer.error.bind(observer),
                      complete: observer.complete.bind(observer),
                    });
                  } else {
                    if (!sessionExpiredHandled) {
                      sessionExpiredHandled = true;
                      window.dispatchEvent(new CustomEvent("auth:session-expired"));
                    }
                    observer.error(error);
                  }
                });
              } else {
                observer.error(error);
              }
            },
            complete: observer.complete.bind(observer),
          });
        } catch (error) {
          console.error("Auth middleware error:", error);
          observer.error(error);
        }
      });

      return () => {
        if (handle) handle.unsubscribe();
      };
    });
  });
}

export function useAuth() {
  const router = useRouter();
  let apolloClient: ApolloClient<any> | null = null;

  try {
    const { resolveClient } = useApolloClient();
    apolloClient = resolveClient();
  } catch (err) {
    console.warn("Apollo client not available in current context");
  }

  /**
   * Login with email and password
   */
  const login = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    loading.value = true;
    error.value = "";

    try {
      if (!apolloClient) {
        throw new Error("Apollo client not initialized");
      }

      const { data } = await apolloClient.mutate<
        { login: LoginResponse },
        MutationLoginArgs
      >({
        mutation: LOGIN_MUTATION,
        variables: { loginInput: { email, password } },
        context: { skipAuth: true },
      });

      const result = data?.login;

      if (!result || (!result.accessToken && !result.refreshToken)) {
        throw new Error("Login falhou");
      }

      accessToken.value = result.accessToken;
      refreshToken.value = result.refreshToken;
      currentUser.value = result.user;

      tokenStorage.setAccessToken(result.accessToken);
      tokenStorage.setRefreshToken(result.refreshToken);
      tokenStorage.setUser(result.user);

      sessionExpiredHandled = false;
      message.success(`Bem-vindo, ${result.user.name}!`);

      return result;
    } catch (err: any) {
      console.error("Erro de login:", err);

      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const gqlError = err.graphQLErrors[0];

        if (gqlError.extensions?.code === "UNAUTHORIZED") {
          error.value = "Email ou senha incorretos";
        } else {
          error.value = gqlError.message || "Ocorreu um erro durante o login";
        }
      } else {
        error.value = "Não foi possível conectar ao servidor. Tente novamente.";
      }

      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Set authentication data
   */
  const setAuthData = (token: string, refresh: string, user: User): void => {
    accessToken.value = token;
    refreshToken.value = refresh;
    currentUser.value = user;

    tokenStorage.setAccessToken(token);
    tokenStorage.setRefreshToken(refresh);
    tokenStorage.setUser(user);
  };

  /**
   * Refresh token
   */
  const refreshTokenMethod = async (): Promise<boolean> => {
    if (!apolloClient) {
      console.warn("Apollo client not available for token refresh during initialization");
      return false;
    }
    return await refreshAccessToken(apolloClient);
  };

  /**
   * Logout
   */
  const logout = (): Promise<boolean> => {
    accessToken.value = "";
    refreshToken.value = "";
    currentUser.value = null;

    tokenStorage.clearTokens();

    if (!apolloClient) {
      return new Promise((resolve) => resolve(true));
    }

    return apolloClient
      .clearStore()
      .then(() => true)
      .catch((...error) => {
        console.warn("Erro ao limpar o store do Apollo Client", error);
        return false;
      });
  };

  if (typeof window !== "undefined" && !globalListenerAdded) {
    globalListenerAdded = true;
    window.addEventListener("auth:session-expired", () => {
      message.warning("Sua sessão expirou. Por favor, faça login novamente.");
      try {
        router.push("/login");
      } catch (error) {
        window.location.href = "/login";
      }
    });
  }

  return {
    loading,
    error,
    currentUser,
    isAuthenticated,
    login,
    logout,
    setAuthData,
    refreshToken: refreshTokenMethod,
  };
}

export function setupAuthLink(apolloClient: ApolloClient<any>): ApolloLink {
  return createAuthLink(apolloClient);
}
