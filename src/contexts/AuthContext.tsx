import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { login as loginAPI, register as registerAPI, logout as logoutAPI, verifyToken } from '../api/auth.api';
import { tokenService } from '../services/token.service';
import type { User, LoginRequest, RegisterRequest, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (tokenService.hasTokens()) {
          const token = tokenService.getAccessToken();
          console.log('🔑 Token encontrado, verificando...', token?.substring(0, 20) + '...');

          try {
            const data = await verifyToken();
            console.log('✅ Token verificado correctamente:', data);
            if (data?.valid && data?.user) {
              setUser(data.user);
              console.log('👤 Usuario establecido:', data.user);
            } else {
              console.warn('⚠️ Token no válido');
              tokenService.clearTokens();
            }
          } catch (err: any) {
            // Si hay error verificando token, limpiar tokens y continuar
            console.warn('⚠️ Error verificando token:', err?.message);

            // Si el error indica token corrupto, limpiar inmediatamente
            if (err?.message?.includes('next is not a function') ||
                err?.message?.includes('Token corrupto')) {
              console.error('🚨 Token corrupto detectado, limpiando...');
              tokenService.clearTokens();
            } else {
              tokenService.clearTokens();
            }
          }
        } else {
          console.log('ℹ️ No hay token guardado, usuario anónimo');
        }
      } catch (err) {
        console.error('❌ Error en verificación de autenticación:', err);
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
      console.log('🔄 Iniciando login para:', credentials.email);
      
      const data = await loginAPI(credentials);
      console.log('✅ Login exitoso:', data);
      
      // Guardar token (data.token es el que devuelve el backend)
      tokenService.saveTokens(data.token);
      console.log('💾 Token guardado');
      
      // Establecer usuario
      setUser(data.user);
      console.log('👤 Usuario establecido:', data.user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error en el login';
      console.error('❌ Error en login:', errorMessage);
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
      console.log('🔄 Iniciando registro para:', data.email);
      
      const response = await registerAPI(data);
      console.log('✅ Registro exitoso:', response);
      
      // Guardar token
      tokenService.saveTokens(response.token);
      console.log('💾 Token guardado');
      
      // Establecer usuario
      setUser(response.user);
      console.log('👤 Usuario establecido:', response.user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error en el registro';
      console.error('❌ Error en registro:', errorMessage);
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
