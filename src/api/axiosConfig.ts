import axios from 'axios';
import { tokenService } from '../services/token.service';
import { config } from '../config';

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a cada solicitud
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`📤 Enviando petición a: ${config.url} con token`);
    } else {
      console.log(`📤 Enviando petición a: ${config.url} sin token`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ Respuesta de ${response.config.url}:`, response.status);
    return response;
  },
  async (error) => {
    const errorDetails = {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    };

    console.error('❌ Error en respuesta:', errorDetails);

    const originalRequest = error.config;

    // Si el token expiró, intentar refrescarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔄 Token expirado, limpiando tokens...');
        tokenService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      } catch (err) {
        console.error('❌ Error limpiando tokens:', err);
        tokenService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // Si hay error 500 con mensaje relacionado a "next is not a function"
    // probablemente es un token corrupto
    if (error.response?.status === 500 &&
        error.response?.data?.message?.includes('next is not a function')) {
      console.error('🚨 Token corrupto detectado, limpiando tokens...');
      tokenService.clearTokens();
      window.location.href = '/login';
      return Promise.reject(new Error('Token corrupto detectado. Se ha cerrado la sesión.'));
    }

    // Para otros errores 500, mostrar mensaje genérico
    if (error.response?.status === 500) {
      console.error('🚨 Error interno del servidor');
      return Promise.reject(new Error('Error interno del servidor. Inténtalo de nuevo.'));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
