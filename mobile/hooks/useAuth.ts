import { useCallback, useEffect, useState } from "react";
import { AuthStorage } from "../utils/auth";
import { container } from "../services/container";
import { useRouter } from "expo-router";
import { useGlobalStore } from "@/store/store";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { setUserData } = useGlobalStore();
  const router = useRouter();

  const loadUserData = useCallback(async () => {
    const data = await AuthStorage.getUserData();
    setUserData(data);
  }, []);

  const checkAuth = useCallback(async () => {
    const authenticated = await AuthStorage.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      await loadUserData();
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await container.api.login(email, password);
      await AuthStorage.setTokens(response.accessToken, response.refreshToken);
      setIsAuthenticated(true);
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthStorage.clearTokens();
      setIsAuthenticated(false);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };
}
