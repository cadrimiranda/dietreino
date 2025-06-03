import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useGlobalStore } from "@/store/store";
import { authService } from "../services/auth";
import { AuthStorage } from "../utils/auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { setUserData } = useGlobalStore();
  const router = useRouter();

  const loadUserData = useCallback(async () => {
    const data = await authService.getCurrentUser();
    setUserData(data);
  }, [setUserData]);

  const checkAuth = useCallback(async () => {
    const authenticated = await authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      await loadUserData();
    }
    setIsLoading(false);
  }, [loadUserData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      // Update local state
      setUserData(response.user);
      setIsAuthenticated(true);
      
      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUserData(null);
      setIsAuthenticated(false);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
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
