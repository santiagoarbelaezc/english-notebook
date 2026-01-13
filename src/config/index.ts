/**
 * Configuración global de la aplicación
 * Define URLs, constantes y variables de entorno
 */

export const config = {
  // URL del backend API
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Configuración del app
  app: {
    name: 'English Notebook',
    version: '1.0.0'
  },
  
  // Endpoints de autenticación
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      verifyToken: '/auth/verify-token',
      getCurrentUser: '/auth/me'
    }
  },
  
  // Configuración de almacenamiento
  storage: {
    accessTokenKey: 'accessToken',
    refreshTokenKey: 'refreshToken'
  }
};

export default config;
