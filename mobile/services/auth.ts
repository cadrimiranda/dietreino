import { gql } from '@apollo/client';
import { apolloClient } from './apollo';
import { AuthStorage, UserData } from '../utils/auth';
import {
  LoginInput,
  LoginResponse,
  RefreshTokenInput,
  MutationLoginArgs,
  MutationRefreshTokenArgs,
} from '../generated/graphql';

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

export class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const { data } = await apolloClient.mutate<
        { login: LoginResponse },
        MutationLoginArgs
      >({
        mutation: LOGIN_MUTATION,
        variables: {
          loginInput: { email, password },
        },
      });

      if (!data?.login) {
        throw new Error('Login failed');
      }

      const { accessToken, refreshToken, user } = data.login;

      // Store tokens and user data
      await AuthStorage.setTokens(accessToken, refreshToken);
      await AuthStorage.saveUserData(user as UserData);

      return data.login;
    } catch (error: any) {
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const gqlError = error.graphQLErrors[0];
        if (gqlError.extensions?.code === 'UNAUTHORIZED') {
          throw new Error('Email ou senha incorretos');
        } else {
          throw new Error(gqlError.message || 'Erro durante o login');
        }
      } else {
        throw new Error('Não foi possível conectar ao servidor. Tente novamente.');
      }
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const storedRefreshToken = await AuthStorage.getRefreshToken();
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const { data } = await apolloClient.mutate<
        { refreshToken: LoginResponse },
        MutationRefreshTokenArgs
      >({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: {
          refreshTokenInput: { refreshToken: storedRefreshToken },
        },
      });

      if (!data?.refreshToken) {
        throw new Error('Token refresh failed');
      }

      const { accessToken, refreshToken: newRefreshToken, user } = data.refreshToken;

      // Update stored tokens and user data
      await AuthStorage.setTokens(accessToken, newRefreshToken);
      await AuthStorage.saveUserData(user as UserData);

      return accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      await AuthStorage.clearTokens();
      return null;
    }
  }

  async logout(): Promise<void> {
    await AuthStorage.clearTokens();
    await apolloClient.clearStore();
  }

  async getCurrentUser(): Promise<UserData | null> {
    return await AuthStorage.getUserData();
  }

  async isAuthenticated(): Promise<boolean> {
    return await AuthStorage.isAuthenticated();
  }
}

export const authService = new AuthService();