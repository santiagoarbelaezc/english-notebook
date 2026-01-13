import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as loginAPI, register as registerAPI, logout as logoutAPI, verifyToken } from '../api/auth.api';
import { tokenService } from '../services/token.service';
import type { User, LoginRequest, RegisterRequest, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (tokenService.hasTokens()) {
          const data = await verifyToken();
          if (data.valid) {
            setUser(data.user);
          } else {
            tokenService.clearTokens();
          }
        }
      } catch (err) {
        console.error('Error verificando token:', err);
        tokenService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await loginAPI(credentials);
      
      tokenService.saveTokens(data.token);
      setUser(data.user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error en el login';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await registerAPI(data);
      
      tokenService.saveTokens(response.token);
      setUser(response.user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error en el registro';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await logoutAPI();
    } catch (err) {
      console.error('Error en logout:', err);
    } finally {
      tokenService.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
