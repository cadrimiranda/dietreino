import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AuthStorage } from '../../utils/auth';
import { ApiClient } from './types';
import { LoginResponse } from '../../generated/graphql';
import { WorkoutSchedule } from './types';
import { WorkoutType } from '../../types/exercise';
import { WorkoutScheduleList } from '../../types/workout';

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string; extensions?: { code: string } }[];
}

export class HttpApiClient implements ApiClient {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = axios.create({
      baseURL: `${baseURL}/graphql`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  async getWorkoutDetails(): Promise<WorkoutType> {
    const response = await this.api.get('/workout/details');
    return response.data;
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      try {
        const isValid = await AuthStorage.isTokenValid();
        
        if (!isValid) {
          const refreshToken = await AuthStorage.getRefreshToken();
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const newAccessToken = await this.refreshAccessToken(refreshToken);
          await AuthStorage.setTokens(newAccessToken, refreshToken);
          
          config.headers.Authorization = `Bearer ${newAccessToken}`;
        } else {
          const accessToken = await AuthStorage.getAccessToken();
          if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        }

        return config;
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error refreshing token:', error.message);
        } else {
          console.error('Unknown error refreshing token');
        }
        throw error;
      }
    });
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const query = `
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

    const response = await this.api.post<GraphQLResponse<{ login: LoginResponse }>>('', {
      query,
      variables: {
        loginInput: { email, password }
      }
    });

    if (response.data.errors && response.data.errors.length > 0) {
      const error = response.data.errors[0];
      throw new Error(error.message);
    }

    if (!response.data.data?.login) {
      throw new Error('Login failed');
    }

    return response.data.data.login;
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const query = `
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

    const response = await this.api.post<GraphQLResponse<{ refreshToken: LoginResponse }>>('', {
      query,
      variables: {
        refreshTokenInput: { refreshToken }
      }
    });

    if (response.data.errors && response.data.errors.length > 0) {
      const error = response.data.errors[0];
      throw new Error(error.message);
    }

    if (!response.data.data?.refreshToken) {
      throw new Error('Token refresh failed');
    }

    return response.data.data.refreshToken.accessToken;
  }

  async getUserProfile() {
    try {
      const response = await this.api.get('/profile');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        console.error('Unauthorized access');
      }
      throw error;
    }
  }

  async getWorkoutSchedule(): Promise<WorkoutSchedule> {
    const response = await this.api.get('/workout/schedule');
    return response.data;
  }

  async getWorkoutScheduleList(): Promise<WorkoutScheduleList> {
    // TODO: Implement GraphQL query for workout schedule list
    throw new Error('getWorkoutScheduleList not implemented yet');
  }
}
