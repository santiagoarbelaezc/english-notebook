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
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró, intentar refrescarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = tokenService.getRefreshToken();
        if (refreshToken) {
          // Aquí iría la llamada a refrescar token si tu backend lo soporta
          // Por ahora, simplemente limpiar el token
          tokenService.clearTokens();
          window.location.href = '/login';
        }
      } catch (err) {
        tokenService.clearTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
