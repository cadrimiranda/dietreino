import AsyncStorage from "@react-native-async-storage/async-storage";
import { toByteArray } from "base64-js";
import { UserType } from "../generated/graphql";

const AUTH_TOKEN_KEY = "@auth_token";
const REFRESH_TOKEN_KEY = "@refresh_token";
const USER_DATA_KEY = "@user_data";

// Use the generated UserType instead of custom UserData interface
export type UserData = UserType;

/**
 * JWT token payload structure
 * The expirationDate field is expected to be a Unix timestamp in seconds
 * Example token payload:
 * {
 *   "expirationDate": 1680609600,  // April 4, 2023, 12:00:00 UTC
 *   "userId": "123",
 *   "email": "user@example.com"
 * }
 */
interface JWTPayload {
  expirationDate?: number;
  [key: string]: any;
}

function decodeJWT(token: string): JWTPayload | null {
  try {
    const [, payload] = token.split(".");
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    // Pad the base64 string if necessary
    const pad = base64.length % 4;
    const paddedBase64 = pad ? base64 + "=".repeat(4 - pad) : base64;

    // Convert base64 to bytes and then to string
    const bytes = toByteArray(paddedBase64);
    const jsonPayload = new TextDecoder().decode(bytes);

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  const payload = decodeJWT(token);
  if (!payload || !payload.expirationDate) return true;

  // expirationDate is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000;
  return payload.expirationDate < currentTime;
};

export const AuthStorage = {
  isTokenValid: async (): Promise<boolean> => {
    try {
      const token = await AuthStorage.getAccessToken();
      return !isTokenExpired(token);
    } catch (error) {
      console.error("Error checking token validity:", error);
      return false;
    }
  },

  getTokenExpirationDate: async (): Promise<Date | null> => {
    try {
      const token = await AuthStorage.getAccessToken();
      if (!token) return null;

      const payload = decodeJWT(token);
      if (!payload || !payload.expirationDate) return null;

      return new Date(payload.expirationDate * 1000); // Convert seconds to milliseconds
    } catch (error) {
      console.error("Error getting token expiration:", error);
      return null;
    }
  },

  getTimeUntilExpiration: async (): Promise<number | null> => {
    try {
      const expirationDate = await AuthStorage.getTokenExpirationDate();
      if (!expirationDate) return null;

      const now = new Date();
      return Math.max(0, expirationDate.getTime() - now.getTime());
    } catch (error) {
      console.error("Error calculating time until expiration:", error);
      return null;
    }
  },
  setTokens: async (accessToken: string, refreshToken?: string) => {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error("Error saving auth tokens:", error);
      throw error;
    }
  },

  getAccessToken: async () => {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  },

  getRefreshToken: async () => {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  },

  clearTokens: async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error("Error clearing auth tokens:", error);
      throw error;
    }
  },

  isAuthenticated: async () => {
    const token = await AuthStorage.getAccessToken();
    return !!token && !isTokenExpired(token);
  },

  saveUserData: async (userData: UserData): Promise<void> => {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  },

  getUserData: async (): Promise<UserData | null> => {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },
};
