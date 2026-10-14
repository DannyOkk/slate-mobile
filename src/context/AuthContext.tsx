import React, { createContext, useContext, useEffect, useState } from 'react';

import { authService } from '@/services/authService';
import { AuthContextType, LoginPayload, RegisterPayload, User } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inicialización: restaurar sesión si existe token guardado
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await authService.getToken();
        const storedUser = await authService.getUser();

        if (storedToken) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('[AuthContext] Error al inicializar sesión:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  const login = async (credentials: LoginPayload) => {
    const result = await authService.login(credentials);
    setUser(result.user);
    setToken(result.token);
  };

  const register = async (payload: RegisterPayload) => {
    const result = await authService.register(payload);
    setUser(result.user);
    setToken(result.token);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para consumir el contexto de autenticación en cualquier componente.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
