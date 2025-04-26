import { ApolloLink, gql } from "@apollo/client/core";
import { jwtDecode } from "jwt-decode";

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

class TokenStorage {
  getAccessToken() {
    throw new Error("Not implemented");
  }
  setAccessToken(token) {
    throw new Error("Not implemented");
  }
  getRefreshToken() {
    throw new Error("Not implemented");
  }
  setRefreshToken(token) {
    throw new Error("Not implemented");
  }
  clearTokens() {
    throw new Error("Not implemented");
  }
}

class LocalStorageTokenService extends TokenStorage {
  constructor(
    accessTokenKey = "access_token",
    refreshTokenKey = "refresh_token"
  ) {
    super();
    this.accessTokenKey = accessTokenKey;
    this.refreshTokenKey = refreshTokenKey;
  }

  getAccessToken() {
    return localStorage.getItem(this.accessTokenKey);
  }

  setAccessToken(token) {
    localStorage.setItem(this.accessTokenKey, token);
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setRefreshToken(token) {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  clearTokens() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }
}

class TokenValidator {
  isTokenValid(token) {
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      // Margem de segurança de 30 segundos
      return decoded.exp * 1000 > Date.now() + 30000;
    } catch {
      return false;
    }
  }
}

class AuthRefreshService {
  constructor(client, tokenStorage) {
    this.client = client;
    this.tokenStorage = tokenStorage;
    this.tokenValidator = new TokenValidator();
    this.refreshInProgress = false;
    this.refreshQueue = [];
  }

  async ensureValidToken() {
    const accessToken = this.tokenStorage.getAccessToken();

    if (this.tokenValidator.isTokenValid(accessToken)) {
      return accessToken;
    }

    return this.refreshAuthentication();
  }

  async refreshAuthentication() {
    if (this.refreshInProgress) {
      return new Promise((resolve) => {
        this.refreshQueue.push(resolve);
      });
    }

    this.refreshInProgress = true;

    try {
      const refreshToken = this.tokenStorage.getRefreshToken();

      if (!refreshToken) {
        this.handleAuthFailure(new Error("No refresh token available"));
        return null;
      }

      const { data } = await this.client.mutate({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: {
          refreshTokenInput: { refreshToken },
        },
        context: { skipAuth: true }, // Evita loop infinito
      });

      const result = data?.refreshToken;

      if (result?.accessToken && result?.refreshToken) {
        this.tokenStorage.setAccessToken(result.accessToken);
        this.tokenStorage.setRefreshToken(result.refreshToken);

        this.resolveQueue(result.accessToken);
        return result.accessToken;
      } else {
        this.handleAuthFailure(new Error("Invalid refresh response"));
        return null;
      }
    } catch (error) {
      this.handleAuthFailure(error);
      return null;
    } finally {
      this.refreshInProgress = false;
    }
  }

  resolveQueue(accessToken) {
    this.refreshQueue.forEach((resolve) => resolve(accessToken));
    this.refreshQueue = [];
  }

  handleAuthFailure(error) {
    console.error("Authentication refresh failed:", error);
    this.tokenStorage.clearTokens();
    this.refreshQueue.forEach((resolve) => resolve(null));
    this.refreshQueue = [];

    window.dispatchEvent(new CustomEvent("auth:session-expired"));
  }
}

export function createAuthMiddleware(apolloClient) {
  const tokenStorage = new LocalStorageTokenService();
  const authService = new AuthRefreshService(apolloClient, tokenStorage);

  return new ApolloLink((operation, forward) => {
    if (operation.getContext().skipAuth) {
      return forward(operation);
    }

    return new Promise(async (resolve) => {
      try {
        const token = await authService.ensureValidToken();

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
}

// Exemplo de configuração do Apollo Client
/*
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';

// Cria um link HTTP
const httpLink = new HttpLink({ uri: 'https://api.example.com/graphql' });

// Cria um cliente Apollo temporário para resolver a dependência circular
const tempClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink
});

// Cria o middleware de autenticação
const authLink = createAuthMiddleware(tempClient);

// Cria o cliente Apollo real com o middleware configurado
const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([authLink, httpLink])
});

export default apolloClient;
*/
