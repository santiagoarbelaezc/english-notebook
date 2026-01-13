import axiosInstance from './axiosConfig';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

// Login
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

// Register
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
  return response.data;
};

// Logout
export const logout = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
};

// Obtener usuario actual
export const getCurrentUser = async (): Promise<{ success: boolean; user: User }> => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

// Verificar token
export const verifyToken = async (): Promise<{ success: boolean; valid: boolean; user: User }> => {
  const response = await axiosInstance.get('/auth/verify-token');
  return response.data;
};
