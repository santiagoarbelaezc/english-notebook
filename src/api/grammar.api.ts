import axiosInstance from './axiosConfig';
import type {
  CreateGrammarRuleRequest,
  UpdateGrammarRuleRequest,
  GrammarRulesResponse,
  GrammarRuleResponse,
  GrammarStatsResponse,
  HighlightedWordsResponse,
  AddHighlightedWordRequest,
  UpdateHighlightedWordColorRequest,
  AddRelatedVocabularyRequest
} from '../types';

// Get all grammar rules
export const getAllGrammarRules = async (params?: {
  category?: string;
  difficulty?: string;
  isFavorite?: boolean;
  search?: string;
}): Promise<GrammarRulesResponse> => {
  const response = await axiosInstance.get<GrammarRulesResponse>('/grammar', { params });
  return response.data;
};

// Create new grammar rule
export const createGrammarRule = async (data: CreateGrammarRuleRequest): Promise<GrammarRuleResponse> => {
  const response = await axiosInstance.post<GrammarRuleResponse>('/grammar', data);
  return response.data;
};

// Get specific grammar rule
export const getGrammarRule = async (id: string): Promise<GrammarRuleResponse> => {
  const response = await axiosInstance.get<GrammarRuleResponse>(`/grammar/${id}`);
  return response.data;
};

// Update grammar rule
export const updateGrammarRule = async (id: string, data: UpdateGrammarRuleRequest): Promise<GrammarRuleResponse> => {
  const response = await axiosInstance.put<GrammarRuleResponse>(`/grammar/${id}`, data);
  return response.data;
};

// Delete grammar rule
export const deleteGrammarRule = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete(`/grammar/${id}`);
  return response.data;
};

// Toggle favorite
export const toggleGrammarRuleFavorite = async (id: string): Promise<GrammarRuleResponse> => {
  const response = await axiosInstance.put<GrammarRuleResponse>(`/grammar/${id}/favorite`);
  return response.data;
};

// Add related vocabulary
export const addRelatedVocabulary = async (id: string, data: AddRelatedVocabularyRequest): Promise<GrammarRuleResponse> => {
  const response = await axiosInstance.post<GrammarRuleResponse>(`/grammar/${id}/vocabulary`, data);
  return response.data;
};

// Get highlighted words
export const getHighlightedWords = async (id: string): Promise<HighlightedWordsResponse> => {
  const response = await axiosInstance.get<HighlightedWordsResponse>(`/grammar/${id}/highlights`);
  return response.data;
};

// Add highlighted word
export const addHighlightedWord = async (id: string, data: AddHighlightedWordRequest): Promise<GrammarRuleResponse> => {
  const response = await axiosInstance.post<GrammarRuleResponse>(`/grammar/${id}/highlights`, data);
  return response.data;
};

// Update highlighted word color
export const updateHighlightedWordColor = async (id: string, word: string, data: UpdateHighlightedWordColorRequest): Promise<GrammarRuleResponse> => {
  const response = await axiosInstance.put<GrammarRuleResponse>(`/grammar/${id}/highlights/${encodeURIComponent(word)}`, data);
  return response.data;
};

// Remove highlighted word
export const removeHighlightedWord = async (id: string, word: string): Promise<GrammarRuleResponse> => {
  const response = await axiosInstance.delete<GrammarRuleResponse>(`/grammar/${id}/highlights/${encodeURIComponent(word)}`);
  return response.data;
};

// Get rules by category
export const getGrammarRulesByCategory = async (categoryName: string): Promise<GrammarRulesResponse> => {
  const response = await axiosInstance.get<GrammarRulesResponse>(`/grammar/category/${categoryName}`);
  return response.data;
};

// Get rules by difficulty
export const getGrammarRulesByDifficulty = async (level: string): Promise<GrammarRulesResponse> => {
  const response = await axiosInstance.get<GrammarRulesResponse>(`/grammar/difficulty/${level}`);
  return response.data;
};

// Get stats
export const getGrammarStats = async (): Promise<GrammarStatsResponse> => {
  const response = await axiosInstance.get<GrammarStatsResponse>('/grammar/stats/overview');
  return response.data;
};