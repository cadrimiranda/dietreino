import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ApolloClient } from "@apollo/client/core";
import { useApolloClient } from "@vue/apollo-composable";
import { message } from "ant-design-vue";
import gql from "graphql-tag";

import {
  LocalStorageTokenService,
  TokenValidator,
} from "../security/authStorage";
import {
  LoginResponse,
  MutationRefreshTokenArgs,
} from "@/generated/graphql";

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

const isSessionActive = ref<boolean>(false);
const isRefreshing = ref<boolean>(false);
const lastSessionCheck = ref<number>(0);

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

export function useSessionControl() {
  let router: any = null;
  let apolloClient: ApolloClient<any> | null = null;

  try {
    router = useRouter();
  } catch (err) {
    console.warn("Router not available in current context");
  }

  try {
    const { resolveClient } = useApolloClient();
    apolloClient = resolveClient();
  } catch (err) {
    console.warn("Apollo client not available in current context");
  }

  const hasValidSession = computed(() => {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();
    
    if (tokenValidator.isTokenValid(accessToken)) {
      return true;
    }
    
    return tokenValidator.isRefreshTokenValid(refreshToken);
  });

  const shouldRefresh = computed(() => {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();
    
    return tokenValidator.shouldRefreshToken(accessToken) && 
           tokenValidator.isRefreshTokenValid(refreshToken);
  });

  async function refreshSession(): Promise<boolean> {
    if (isRefreshing.value) {
      return new Promise((resolve) => {
        const checkRefresh = setInterval(() => {
          if (!isRefreshing.value) {
            clearInterval(checkRefresh);
            resolve(hasValidSession.value);
          }
        }, 100);
      });
    }

    isRefreshing.value = true;

    try {
      const refreshToken = tokenStorage.getRefreshToken();
      
      if (!refreshToken || !apolloClient) {
        throw new Error("Refresh token ou Apollo client não disponível");
      }

      const { data } = await apolloClient.mutate<
        { refreshToken: LoginResponse },
        MutationRefreshTokenArgs
      >({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: {
          refreshTokenInput: { refreshToken },
        },
        context: { skipAuth: true },
      });

      const result = data?.refreshToken;
      
      if (result?.accessToken && result?.refreshToken) {
        tokenStorage.setAccessToken(result.accessToken);
        tokenStorage.setRefreshToken(result.refreshToken);
        
        if (result.user) {
          tokenStorage.setUser(result.user);
        }

        isSessionActive.value = true;
        lastSessionCheck.value = Date.now();
        return true;
      }

      throw new Error("Failed to refresh session");
    } catch (error) {
      console.error("Session refresh failed:", error);
      expireSession();
      return false;
    } finally {
      isRefreshing.value = false;
    }
  }

  function expireSession(): void {
    tokenStorage.clearTokens();
    isSessionActive.value = false;
    message.warning("Sua sessão expirou. Por favor, faça login novamente.");
    
    if (router && router.currentRoute) {
      router.push("/login");
    } else {
      window.location.href = "/login";
    }
  }

  async function checkSession(): Promise<boolean> {
    const now = Date.now();
    
    if (now - lastSessionCheck.value < SESSION_CHECK_INTERVAL) {
      return hasValidSession.value;
    }

    lastSessionCheck.value = now;

    if (!hasValidSession.value) {
      if (router && router.currentRoute && router.currentRoute.value.path !== "/login") {
        expireSession();
      }
      return false;
    }

    if (shouldRefresh.value) {
      return await refreshSession();
    }

    const accessToken = tokenStorage.getAccessToken();
    isSessionActive.value = tokenValidator.isTokenValid(accessToken);
    
    return isSessionActive.value;
  }

  function initializeSession(): boolean {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();

    if (!accessToken && !refreshToken) {
      return false;
    }

    if (tokenValidator.isTokenValid(accessToken)) {
      isSessionActive.value = true;
      return true;
    }

    if (tokenValidator.isRefreshTokenValid(refreshToken)) {
      refreshSession();
      return true;
    }

    expireSession();
    return false;
  }

  function startSessionMonitoring(): void {
    setInterval(() => {
      if (router && router.currentRoute && router.currentRoute.value.path !== "/login") {
        checkSession();
      }
    }, SESSION_CHECK_INTERVAL);

    window.addEventListener("focus", () => {
      if (router && router.currentRoute && router.currentRoute.value.path !== "/login") {
        checkSession();
      }
    });

    window.addEventListener("storage", (event) => {
      if (
        event.key === "access_token" ||
        event.key === "refresh_token" ||
        event.key === "user"
      ) {
        if (!event.newValue) {
          expireSession();
        } else {
          checkSession();
        }
      }
    });
  }

  return {
    hasValidSession,
    shouldRefresh,
    isSessionActive,
    isRefreshing,
    refreshSession,
    expireSession,
    checkSession,
    initializeSession,
    startSessionMonitoring,
  };
}