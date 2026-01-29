// Tipos para vocabulario

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
