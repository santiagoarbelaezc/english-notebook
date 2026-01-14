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
    console.error('❌ Error en respuesta:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    const originalRequest = error.config;

    // Si el token expiró, intentar refrescarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        tokenService.clearTokens();
        window.location.href = '/login';
      } catch (err) {
        tokenService.clearTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
