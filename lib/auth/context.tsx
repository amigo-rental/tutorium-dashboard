"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { User } from "@/types";
import { apiClient } from "@/lib/utils/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Check for existing token on mount
    const existingToken = apiClient.getToken();

    if (existingToken) {
      setToken(existingToken);
      // Try to get user data from localStorage as well
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data && typeof response.data === 'object' && 'user' in response.data && 'token' in response.data) {
        const { user: userData, token: tokenData } = response.data as { user: User; token: string };

        setUser(userData);
        setToken(tokenData);
        apiClient.setToken(tokenData);
        
        // Store user data in localStorage for persistence
        if (typeof window !== "undefined") {
          localStorage.setItem('user_data', JSON.stringify(userData));
        }

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

      if (response.data && typeof response.data === 'object' && 'user' in response.data && 'token' in response.data) {
        const { user: userData, token: tokenData } = response.data as { user: User; token: string };

        setUser(userData);
        setToken(tokenData);
        apiClient.setToken(tokenData);
        
        // Store user data in localStorage for persistence
        if (typeof window !== "undefined") {
          localStorage.setItem('user_data', JSON.stringify(userData));
        }

        return { success: true };
      }

      return { success: false, error: "Registration failed" };
    } catch (error) {
      console.error("Registration error:", error);

      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiClient.clearToken();
    
    // Clear user data from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem('user_data');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
