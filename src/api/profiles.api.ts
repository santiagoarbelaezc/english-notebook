import api from './axiosConfig';

export interface Profile {
  user: {
    _id: string;
    name?: string; // Cambiado de firstName/lastName a name
    username: string;
    email: string;
    englishLevel?: string;
    createdAt?: string;
  };
  profileImage?: string;
  bio?: string;
  nativeLanguage?: string;
  statistics: {
    totalVocabulary: number;
    totalGrammarRules: number;
    totalConversations: number;
    totalSongs: number;
    streakDays: number;
    lastActiveDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProfileSummary {
  user: {
    name?: string;
    username: string;
    email: string;
    englishLevel?: string;
    profileImage?: string;
    bio?: string;
  };
  statistics: {
    totalVocabulary: number;
    totalGrammarRules: number;
    totalConversations: number;
    totalSongs: number;
    streakDays: number;
    lastActiveDate: string;
  };
  memberSince: string;
  level?: string; // Para compatibilidad
  totalPoints?: number;
  achievements?: number;
  completionRate?: number;
}

export interface DetailedStats {
  overview: {
    totalVocabulary: number;
    totalGrammarRules: number;
    totalConversations: number;
    totalSongs: number;
    streakDays: number;
    lastActiveDate: string;
  };
  vocabularyByDifficulty: Array<{ _id: string; count: number }>;
  vocabularyByCategory: Array<{ _id: string; count: number }>;
  conversationsByTopic: Array<{ _id: string; count: number }>;
  songsByTopic: Array<{ _id: string; count: number }>;
  totalMessages: number;
  vocabulary?: { learned: number; total: number; mastered: number }; // Para compatibilidad
  grammar?: { completed: number; total: number };
  conversations?: { completed: number; total: number };
  streak?: { current: number; longest: number; lastUpdated: string };
}

export interface LearningProgress {
  weekly: {
    date: string;
    points: number;
    activities: number;
  }[];
  monthly: {
    month: string;
    points: number;
    activities: number;
  }[];
}

// Mi perfil
export const getMyProfile = async (): Promise<Profile> => {
  const response = await api.get('/profiles/me');
  // Manejar diferentes formatos de respuesta
  const data = response.data;
  console.log('API Response for getMyProfile:', data);

  // Si los datos están directamente en response.data
  if (data && data.id && data.username) {
    return {
      user: {
        _id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        englishLevel: data.englishLevel
      },
      profileImage: data.profileImage,
      bio: data.bio,
      nativeLanguage: data.nativeLanguage,
      statistics: data.statistics || {
        totalVocabulary: 0,
        totalGrammarRules: 0,
        totalConversations: 0,
        totalSongs: 0,
        streakDays: 0,
        lastActiveDate: new Date().toISOString()
      },
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    };
  }

  // Si los datos están en response.data.profile
  if (data.profile) {
    return data.profile;
  }

  // Si no hay estructura reconocida, devolver datos básicos
  console.warn('Unexpected profile data structure:', data);
  return {
    user: {
      _id: 'unknown',
      name: 'Usuario',
      username: 'usuario',
      email: 'usuario@ejemplo.com',
      englishLevel: 'A1'
    },
    profileImage: undefined,
    bio: undefined,
    nativeLanguage: undefined,
    statistics: {
      totalVocabulary: 0,
      totalGrammarRules: 0,
      totalConversations: 0,
      totalSongs: 0,
      streakDays: 0,
      lastActiveDate: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const updateProfile = async (data: Partial<Profile>): Promise<Profile> => {
  const response = await api.put('/profiles/me', data);
  return response.data;
};

export const uploadProfileImage = async (file: File): Promise<{ profileImage: string }> => {
  const formData = new FormData();
  formData.append('profileImage', file);

  const response = await api.post('/profiles/me/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getProfileSummary = async (): Promise<ProfileSummary> => {
  const response = await api.get('/profiles/me/summary');
  return response.data.summary; // Acceder al campo summary
};

export const getDetailedStats = async (): Promise<DetailedStats> => {
  const response = await api.get('/profiles/me/stats');
  return response.data.statistics; // Acceder al campo statistics
};

export const getLearningProgress = async (): Promise<LearningProgress> => {
  const response = await api.get('/profiles/me/progress');
  return response.data;
};

export const updateStreak = async (): Promise<void> => {
  await api.put('/profiles/me/streak');
};

export const recalculateStats = async (): Promise<void> => {
  await api.put('/profiles/me/recalculate-stats');
};

// Perfil público
export const getPublicProfile = async (username: string): Promise<Profile> => {
  const response = await api.get(`/profiles/${username}`);
  return response.data.profile; // Acceder al campo profile
};
