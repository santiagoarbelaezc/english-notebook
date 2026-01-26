import axiosInstance from './axiosConfig';
import type { UpdateUserData, ChangePasswordData, UserResponse } from '../types/user.types';

// Obtener datos del usuario actual
export const getUserProfile = async (): Promise<UserResponse> => {
  const response = await axiosInstance.get<UserResponse>('/users/me');
  return response.data;
};

// Actualizar perfil del usuario (name, email, englishLevel)
export const updateUserProfile = async (data: UpdateUserData): Promise<UserResponse> => {
  const response = await axiosInstance.put<UserResponse>('/users/me', data);
  return response.data;
};

// Cambiar contraseña
export const changePassword = async (data: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.put<{ success: boolean; message: string }>('/users/me/password', data);
  return response.data;
};

// Eliminar cuenta
export const deleteAccount = async (password: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete<{ success: boolean; message: string }>('/users/me', { data: { password } });
  return response.data;
};