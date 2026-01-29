export interface DailyPhrase {
  _id: string;
  user: string;
  phrase: string;
  translation: string;
  type: 'idiom' | 'expression' | 'slang' | 'proverb' | 'quote' | 'phrase' | 'saying';
  keywords: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDailyPhraseRequest {
  phrase: string;
  translation: string;
  type?: DailyPhrase['type'];
  keywords?: string[];
}

export interface UpdateDailyPhraseRequest {
  phrase?: string;
  translation?: string;
  type?: DailyPhrase['type'];
  keywords?: string[];
  isFavorite?: boolean;
}

export interface DailyPhrasesResponse {
  success: boolean;
  count: number;
  phrases: DailyPhrase[];
}

export interface DailyPhraseResponse {
  success: boolean;
  phrase: DailyPhrase;
}

export interface StatsResponse {
  success: boolean;
  stats: {
    totalPhrases: number;
    favoritePhrases: number;
    byType: { _id: string; count: number }[];
    topKeywords: { _id: string; count: number }[];
  };
}