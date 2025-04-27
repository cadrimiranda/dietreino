import { jwtDecode } from "jwt-decode";

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
  getUser() {
    throw new Error("Not implemented");
  }
  setUser() {
    throw new Error("Not implemented");
  }
  clearTokens() {
    throw new Error("Not implemented");
  }
}

export class LocalStorageTokenService extends TokenStorage {
  constructor(
    accessTokenKey = "access_token",
    refreshTokenKey = "refresh_token",
    userKey = "user"
  ) {
    super();
    this.accessTokenKey = accessTokenKey;
    this.refreshTokenKey = refreshTokenKey;
    this.userKey = userKey;
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

  getUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  clearTokens() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }
}

export class TokenValidator {
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
