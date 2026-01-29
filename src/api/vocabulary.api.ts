import axiosConfig from './axiosConfig';

// Types
export interface VocabularyWord {
  _id: string;
  user: string;
  word: string;
  pronunciation: string;
  meanings: {
    meaning: string;
    partOfSpeech: string;
  }[];
  examples: {
    english: string;
    spanish: string;
  }[];
  synonyms: string[];
  antonyms: string[];
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: 'daily-life' | 'business' | 'travel' | 'food' | 'nature' | 'technology' | 'emotions' | 'sports' | 'other';
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVocabularyRequest {
  word: string;
  pronunciation?: string;
  meanings: {
    meaning: string;
    partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'interjection' | 'other';
  }[];
  examples?: {
    english: string;
    spanish?: string;
  }[];
  synonyms?: string[];
  antonyms?: string[];
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category?: 'daily-life' | 'business' | 'travel' | 'food' | 'nature' | 'technology' | 'emotions' | 'sports' | 'other';
  isFavorite?: boolean;
}

export interface UpdateVocabularyRequest extends Partial<CreateVocabularyRequest> {}

export interface VocabularyFilters {
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category?: 'daily-life' | 'business' | 'travel' | 'food' | 'nature' | 'technology' | 'emotions' | 'sports' | 'other';
  isFavorite?: boolean;
  search?: string;
}

export interface VocabularyResponse {
  success: boolean;
  count?: number;
  vocabulary?: VocabularyWord[];
  message?: string;
}

export interface VocabularyStats {
  totalWords: number;
  favoriteWords: number;
  byDifficulty: { _id: string; count: number }[];
  byCategory: { _id: string; count: number }[];
}

// API Functions
export const getAllVocabulary = async (filters?: VocabularyFilters): Promise<VocabularyResponse> => {
  try {
    const params = new URLSearchParams();

    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isFavorite !== undefined) params.append('isFavorite', filters.isFavorite.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await axiosConfig.get(`/vocabulary?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    throw error;
  }
};

export const createVocabularyWord = async (data: CreateVocabularyRequest): Promise<VocabularyResponse> => {
  try {
    const response = await axiosConfig.post('/vocabulary', data);
    return response.data;
  } catch (error) {
    console.error('Error creating vocabulary word:', error);
    throw error;
  }
};

export const getVocabularyWord = async (id: string): Promise<VocabularyResponse> => {
  try {
    const response = await axiosConfig.get(`/vocabulary/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vocabulary word:', error);
    throw error;
  }
};

export const updateVocabularyWord = async (id: string, data: UpdateVocabularyRequest): Promise<VocabularyResponse> => {
  try {
    const response = await axiosConfig.put(`/vocabulary/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating vocabulary word:', error);
    throw error;
  }
};

export const deleteVocabularyWord = async (id: string): Promise<VocabularyResponse> => {
  try {
    const response = await axiosConfig.delete(`/vocabulary/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting vocabulary word:', error);
    throw error;
  }
};

export const toggleVocabularyFavorite = async (id: string): Promise<VocabularyResponse> => {
  try {
    const response = await axiosConfig.put(`/vocabulary/${id}/favorite`);
    return response.data;
  } catch (error) {
    console.error('Error toggling vocabulary favorite:', error);
    throw error;
  }
};

export const getVocabularyByDifficulty = async (level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'): Promise<VocabularyResponse> => {
  try {
    const response = await axiosConfig.get(`/vocabulary/difficulty/${level}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vocabulary by difficulty:', error);
    throw error;
    throw error;
  }
};

export const getVocabularyByCategory = async (category: 'daily-life' | 'business' | 'travel' | 'food' | 'nature' | 'technology' | 'emotions' | 'sports' | 'other'): Promise<VocabularyResponse> => {
  try {
    const response = await axiosConfig.get(`/vocabulary/category/${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vocabulary by category:', error);
    throw error;
  }
};

export const getVocabularyStats = async (): Promise<{ success: boolean; stats: VocabularyStats }> => {
  try {
    const response = await axiosConfig.get('/vocabulary/stats/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching vocabulary stats:', error);
    throw error;
  }
};