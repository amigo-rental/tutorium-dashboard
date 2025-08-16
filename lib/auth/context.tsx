"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { User } from "@/types";
import { apiClient } from "@/lib/utils/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to get user data from the profile API
        // This will work if there's a valid HTTP-only cookie
        const response = await apiClient.getUser();

        if (response.data && !response.error) {
          setUser(response.data as User);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);

      if (response.error) {
        return { success: false, error: response.error };
      }

      // After successful login, the server sets HTTP-only cookie
      // We need to fetch user data to confirm login and set local state
      if (
        response.data &&
        typeof response.data === "object" &&
        "user" in response.data
      ) {
        const { user: userData } = response.data as { user: User };

        setUser(userData);

        return { success: true };
      }

      return { success: false, error: "Login failed" };
    } catch (error) {
      console.error("Login error:", error);

      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role = "TEACHER",
  ) => {
    try {
      const response = await apiClient.register(name, email, password, role);

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (
        response.data &&
        typeof response.data === "object" &&
        "user" in response.data
      ) {
        const { user: userData } = response.data as { user: User };

        setUser(userData);

        return { success: true };
      }

      return { success: false, error: "Registration failed" };
    } catch (error) {
      console.error("Registration error:", error);

      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side cookie
      await apiClient.logout();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prevUser) => {
      if (prevUser) {
        return { ...prevUser, ...userData };
      }

      return null;
    });
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.getUser();

      if (response.data && !response.error) {
        setUser(response.data as User);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
