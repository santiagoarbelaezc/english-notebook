export interface GrammarRule {
  _id: string;
  user: string;
  title: string;
  description: string;
  explanation: string;
  structure?: string;
  highlightedWords: HighlightedWord[];
  examples: GrammarExample[];
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced';
  category: 'tenses' | 'verbs' | 'nouns' | 'adjectives' | 'adverbs' | 'pronouns' | 'prepositions' | 'conditionals' | 'passive-voice' | 'word-order' | 'articles' | 'other';
  relatedVocabulary: string[];
  isFavorite: boolean;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HighlightedWord {
  word: string;
  color: string;
}

export interface GrammarExample {
  correct: string;
  incorrect?: string;
  explanation?: string;
}

export interface CreateGrammarRuleRequest {
  title: string;
  description: string;
  explanation: string;
  structure?: string;
  highlightedWords: HighlightedWord[];
  examples: GrammarExample[];
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced';
  category: 'tenses' | 'verbs' | 'nouns' | 'adjectives' | 'adverbs' | 'pronouns' | 'prepositions' | 'conditionals' | 'passive-voice' | 'word-order' | 'articles' | 'other';
  relatedVocabulary: string[];
  notes?: string;
  tags: string[];
}

export interface UpdateGrammarRuleRequest {
  title?: string;
  description?: string;
  explanation?: string;
  structure?: string;
  highlightedWords?: HighlightedWord[];
  examples?: GrammarExample[];
  difficulty?: 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced';
  category?: 'tenses' | 'verbs' | 'nouns' | 'adjectives' | 'adverbs' | 'pronouns' | 'prepositions' | 'conditionals' | 'passive-voice' | 'word-order' | 'articles' | 'other';
  relatedVocabulary?: string[];
  notes?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface GrammarRulesResponse {
  success: boolean;
  count: number;
  grammar: GrammarRule[];
}

export interface GrammarRuleResponse {
  success: boolean;
  grammar: GrammarRule;
}

export interface GrammarStatsResponse {
  success: boolean;
  stats: {
    totalRules: number;
    favoriteRules: number;
    byCategory: Array<{
      _id: string;
      count: number;
    }>;
    byDifficulty: Array<{
      _id: string;
      count: number;
    }>;
  };
}

export interface HighlightedWordsResponse {
  success: boolean;
  rule: string;
  structure?: string;
  highlightedWords: Array<{
    word: string;
    color: string;
  }>;
}

export interface AddHighlightedWordRequest {
  word: string;
  color: string;
}

export interface UpdateHighlightedWordColorRequest {
  color: string;
}

export interface AddRelatedVocabularyRequest {
  vocabularyId: string;
}
