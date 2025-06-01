import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

abstract class TokenStorage {
  getAccessToken(): string | null {
    throw new Error("Not implemented");
  }

  setAccessToken(token: string): void {
    throw new Error("Not implemented");
  }

  getRefreshToken(): string | null {
    throw new Error("Not implemented");
  }

  setRefreshToken(token: string): void {
    throw new Error("Not implemented");
  }

  getUser(): User | null {
    throw new Error("Not implemented");
  }

  setUser(user: User): void {
    throw new Error("Not implemented");
  }

  clearTokens(): void {
    throw new Error("Not implemented");
  }
}

export class LocalStorageTokenService extends TokenStorage {
  private accessTokenKey: string;
  private refreshTokenKey: string;
  private userKey: string;

  constructor(
    accessTokenKey: string = "access_token",
    refreshTokenKey: string = "refresh_token",
    userKey: string = "user"
  ) {
    super();
    this.accessTokenKey = accessTokenKey;
    this.refreshTokenKey = refreshTokenKey;
    this.userKey = userKey;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(this.accessTokenKey, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }
}

export class TokenValidator {
  isTokenValid(token: string | null): boolean {
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  isRefreshTokenValid(refreshToken: string | null): boolean {
    if (!refreshToken) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(refreshToken);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  shouldRefreshToken(token: string | null): boolean {
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const tenMinutesFromNow = Date.now() + (10 * 60 * 1000);
      return decoded.exp * 1000 <= tenMinutesFromNow;
    } catch {
      return true;
    }
  }
}
