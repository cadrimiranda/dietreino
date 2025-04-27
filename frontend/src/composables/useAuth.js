import { ref, reactive, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { ApolloLink, gql } from "@apollo/client/core";
import { useApolloClient } from "@vue/apollo-composable";
import { message } from "ant-design-vue";

import {
  LocalStorageTokenService,
  TokenValidator,
} from "../security/authStorage";

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

export function useAuth() {
  const loading = ref(false);
  const error = ref("");
  const tokenStorage = new LocalStorageTokenService();
  const tokenValidator = new TokenValidator();

  // Refs para os tokens e usuário
  const accessToken = ref(tokenStorage.getAccessToken() || "");
  const refreshToken = ref(tokenStorage.getRefreshToken() || "");
  const currentUser = ref(tokenStorage.getUser());

  const refreshState = reactive({
    inProgress: false,
    queue: [],
  });

  const router = useRouter();
  const { resolveClient } = useApolloClient();

  /**
   * Computed property para verificar se o usuário está autenticado
   */
  const isAuthenticated = computed(() => {
    return tokenValidator.isTokenValid(accessToken.value);
  });

  /**
   * Login com email e senha
   */
  const login = async (email, password) => {
    loading.value = true;
    error.value = "";

    try {
      const apolloClient = resolveClient();
      const { data } = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          loginInput: { email, password },
        },
      });

      const result = data.login;

      if (result.accessToken && result.refreshToken) {
        // Atualizar os tokens e o usuário
        accessToken.value = result.accessToken;
        refreshToken.value = result.refreshToken;
        currentUser.value = result.user;

        // Salvar no storage
        tokenStorage.setAccessToken(result.accessToken);
        tokenStorage.setRefreshToken(result.refreshToken);
        tokenStorage.setUser(result.user);

        message.success(`Bem-vindo, ${result.user.name}!`);

        return result;
      }

      throw new Error("Login falhou");
    } catch (err) {
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
   * Logout
   */
  const logout = () => {
    accessToken.value = "";
    refreshToken.value = "";
    currentUser.value = null;

    tokenStorage.clearTokens();

    const apolloClient = resolveClient();
    if (apolloClient) {
      apolloClient.clearStore();
    }

    window.dispatchEvent(new CustomEvent("auth:logout"));

    router.push("/login");
  };

  /**
   * Garantir que um token válido está disponível
   */
  const ensureValidToken = async () => {
    if (tokenValidator.isTokenValid(accessToken.value)) {
      return accessToken.value;
    }

    // Caso contrário, tentar fazer refresh
    return refreshAuthentication();
  };

  /**
   * Atualizar o token
   */
  const refreshAuthentication = async () => {
    if (refreshState.inProgress) {
      return new Promise((resolve) => {
        refreshState.queue.push(resolve);
      });
    }

    refreshState.inProgress = true;

    try {
      if (!refreshToken.value) {
        handleAuthFailure(new Error("No refresh token available"));
        return null;
      }

      const apolloClient = resolveClient();
      const { data } = await apolloClient.mutate({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: {
          refreshTokenInput: { refreshToken: refreshToken.value },
        },
        context: { skipAuth: true }, // Evitar loop infinito
      });

      const result = data?.refreshToken;

      if (result?.accessToken && result?.refreshToken) {
        // Atualizar os refs
        accessToken.value = result.accessToken;
        refreshToken.value = result.refreshToken;

        // Atualizar o storage
        tokenStorage.setAccessToken(result.accessToken);
        tokenStorage.setRefreshToken(result.refreshToken);

        if (result.user) {
          currentUser.value = result.user;
          tokenStorage.setUser(result.user);
        }

        // Resolver a fila de promises
        refreshState.queue.forEach((resolve) => resolve(result.accessToken));
        refreshState.queue = [];

        return result.accessToken;
      } else {
        handleAuthFailure(new Error("Invalid refresh response"));
        return null;
      }
    } catch (error) {
      handleAuthFailure(error);
      return null;
    } finally {
      refreshState.inProgress = false;
    }
  };

  /**
   * Lidar com falhas de autenticação
   */
  const handleAuthFailure = (error) => {
    console.error("Authentication refresh failed:", error);

    accessToken.value = "";
    refreshToken.value = "";
    currentUser.value = null;

    tokenStorage.clearTokens();

    refreshState.queue.forEach((resolve) => resolve(null));
    refreshState.queue = [];

    window.dispatchEvent(new CustomEvent("auth:session-expired"));

    const apolloClient = resolveClient();
    if (apolloClient) {
      apolloClient.clearStore();
    }

    router.push("/login");
  };

  /**
   * Criar middleware de autenticação para Apollo Client
   */
  const createAuthLink = () => {
    return new ApolloLink((operation, forward) => {
      if (operation.getContext().skipAuth) {
        return forward(operation);
      }

      return new Promise(async (resolve) => {
        try {
          const token = await ensureValidToken();

          if (token) {
            operation.setContext(({ headers = {} }) => ({
              headers: {
                ...headers,
                Authorization: `Bearer ${token}`,
              },
            }));
          }

          resolve(forward(operation));
        } catch (error) {
          console.error("Auth middleware error:", error);
          resolve(forward(operation));
        }
      });
    });
  };

  // Middleware de autenticação para Apollo Client
  const authLink = createAuthLink();

  // Observar alterações nos tokens e usuário para sincronizar com o storage
  watch(accessToken, (newToken) => {
    if (newToken) {
      tokenStorage.setAccessToken(newToken);
    } else {
      tokenStorage.clearTokens();
    }
  });

  watch(refreshToken, (newToken) => {
    if (newToken) {
      tokenStorage.setRefreshToken(newToken);
    }
  });

  watch(currentUser, (newUser) => {
    if (newUser) {
      tokenStorage.setUser(newUser);
    }
  });

  // Adicionar listener para eventos de expiração de sessão
  window.addEventListener("auth:session-expired", () => {
    message.warning("Sua sessão expirou. Por favor, faça login novamente.");
    logout();
  });

  return {
    // Estado
    loading,
    error,
    currentUser,
    isAuthenticated,

    // Métodos
    login,
    logout,
    ensureValidToken,

    // Para configuração do Apollo Client
    authLink,
  };
}

/**
 * Criar middleware de autenticação para Apollo Client
 * Esta função é para uso direto sem o composable Vue
 */
export function createAuthMiddleware(apolloClient) {
  const { authLink } = useAuth();
  return authLink;
}

export const authLink = useAuth().authLink;
