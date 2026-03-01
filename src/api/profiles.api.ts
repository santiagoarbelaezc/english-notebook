import api from './axiosConfig';

// ── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
  user: {
    _id: string;
    name?: string;
    username: string;
    email: string;
    englishLevel?: string;
    createdAt?: string;
  };
  profileImage?: string;
  bio?: string;
  nativeLanguage?: string;
  experience: number;
  level: number;
  statistics: {
    totalVocabulary: number;
    totalGrammarRules: number;
    totalConversations: number;
    totalSongs: number;
    totalTexts: number;
    totalMovies: number;
    totalFlashcards: number;
    totalIrregularVerbs: number;
    streakDays: number;
    longestStreak: number;
    lastLoginDate: string | null;
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
  experience: number;
  level: number;
  achievements: {
    unlocked: number;
    total: number;
  };
  statistics: Profile['statistics'];
  memberSince: string;
}

export interface DetailedStats {
  experience: number;
  level: number;
  vocabulary: { learned: number; total: number; mastered: number };
  grammar: { completed: number; total: number };
  conversations: { completed: number; total: number };
  texts: { total: number };
  songs: { total: number };
  movies: { total: number };
  flashcards: { total: number };
  irregularVerbs: { total: number };
  streak: {
    current: number;
    longest: number;
    lastLogin: string | null;
    lastUpdated: string | null;
  };
  achievements: {
    total: number;
    unlocked: number;
  };
}

export interface LearningProgress {
  currentLevel: string;
  experience: number;
  level: number;
  progressPercentage: number;
  totalActivities: number;
  breakdown: {
    vocabulary: number;
    grammar: number;
    conversations: number;
    songs: number;
    texts: number;
    movies: number;
    flashcards: number;
    irregularVerbs: number;
  };
  streakDays: number;
  longestStreak: number;
  lastActiveDate: string;
}

// ── API Calls ────────────────────────────────────────────────────────────────

export const getMyProfile = async (): Promise<Profile> => {
  const response = await api.get('/profiles/me');
  const data = response.data;

  if (data.profile) return data.profile;

  // Fallback for flat response
  if (data && data.id && data.username) {
    return {
      user: {
        _id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        englishLevel: data.englishLevel,
      },
      profileImage: data.profileImage,
      bio: data.bio,
      nativeLanguage: data.nativeLanguage,
      experience: data.experience || 0,
      level: data.level || 1,
      statistics: data.statistics || {
        totalVocabulary: 0, totalGrammarRules: 0, totalConversations: 0,
        totalSongs: 0, totalTexts: 0, totalMovies: 0, totalFlashcards: 0,
        totalIrregularVerbs: 0, streakDays: 0, longestStreak: 0,
        lastLoginDate: null, lastActiveDate: new Date().toISOString(),
      },
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  }

  throw new Error('Unexpected profile data structure');
};

export const updateProfile = async (data: { bio?: string; nativeLanguage?: string }): Promise<Profile> => {
  const response = await api.put('/profiles/me', data);
  return response.data.profile || response.data;
};

export const uploadProfileImage = async (file: File): Promise<{ profileImage: { url: string } }> => {
  const formData = new FormData();
  formData.append('profileImage', file);
  const response = await api.post('/profiles/me/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getProfileSummary = async (): Promise<ProfileSummary> => {
  const response = await api.get('/profiles/me/summary');
  return response.data.summary;
};

export const getDetailedStats = async (): Promise<DetailedStats> => {
  const response = await api.get('/profiles/me/stats');
  return response.data.statistics;
};

export const getLearningProgress = async (): Promise<LearningProgress> => {
  const response = await api.get('/profiles/me/progress');
  return response.data.progress;
};

export const recalculateStats = async (): Promise<any> => {
  const response = await api.put('/profiles/me/recalculate-stats');
  return response.data;
};

export const getPublicProfile = async (username: string): Promise<Profile> => {
  const response = await api.get(`/profiles/${username}`);
  return response.data.profile;
};
