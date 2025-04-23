import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AuthStorage } from '../../utils/auth';
import { ApiClient } from './types';
import { WorkoutSchedule } from './mock';
import { WorkoutDetails } from '@/types/exercise';

export class HttpApiClient implements ApiClient {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = axios.create({
      baseURL,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  async getWorkoutDetails(): Promise<WorkoutDetails> {
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

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async refreshAccessToken(refreshToken: string) {
    const response = await this.api.post('/auth/refresh', { refreshToken });
    return response.data.accessToken;
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
}
