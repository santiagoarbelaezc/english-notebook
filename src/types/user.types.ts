// Tipos para usuario
export interface UserProfile {
  _id: string;
  name: string;
  username: string;
  email: string;
  englishLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: any; // Relación con Profile
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  englishLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserResponse {
  success: boolean;
  user: UserProfile;
  message?: string;
}
