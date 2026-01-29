import axiosInstance from './axiosConfig';
import type {
  CreateDailyPhraseRequest,
  UpdateDailyPhraseRequest,
  DailyPhrasesResponse,
  DailyPhraseResponse,
  StatsResponse
} from '../types';

// Get all phrases
export const getAllPhrases = async (params?: {
  type?: string;
  isFavorite?: boolean;
  search?: string;
}): Promise<DailyPhrasesResponse> => {
  const response = await axiosInstance.get<DailyPhrasesResponse>('/daily-phrase', { params });
  return response.data;
};

// Create new phrase
export const createPhrase = async (data: CreateDailyPhraseRequest): Promise<DailyPhraseResponse> => {
  const response = await axiosInstance.post<DailyPhraseResponse>('/daily-phrase', data);
  return response.data;
};

// Get single phrase
export const getPhrase = async (id: string): Promise<DailyPhraseResponse> => {
  const response = await axiosInstance.get<DailyPhraseResponse>(`/daily-phrase/${id}`);
  return response.data;
};

// Update phrase
export const updatePhrase = async (id: string, data: UpdateDailyPhraseRequest): Promise<DailyPhraseResponse> => {
  const response = await axiosInstance.put<DailyPhraseResponse>(`/daily-phrase/${id}`, data);
  return response.data;
};

// Delete phrase
export const deletePhrase = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete<{ success: boolean; message: string }>(`/daily-phrase/${id}`);
  return response.data;
};

// Toggle favorite
export const toggleFavorite = async (id: string): Promise<DailyPhraseResponse> => {
  const response = await axiosInstance.put<DailyPhraseResponse>(`/daily-phrase/${id}/favorite`);
  return response.data;
};

// Get random phrase
export const getRandomPhrase = async (): Promise<DailyPhraseResponse> => {
  const response = await axiosInstance.get<DailyPhraseResponse>('/daily-phrase/random/daily');
  return response.data;
};

// Get phrases by type
export const getPhrasesByType = async (type: string): Promise<DailyPhrasesResponse> => {
  const response = await axiosInstance.get<DailyPhrasesResponse>(`/daily-phrase/type/${type}`);
  return response.data;
};

// Get phrases by keyword
export const getPhrasesByKeyword = async (keyword: string): Promise<DailyPhrasesResponse> => {
  const response = await axiosInstance.get<DailyPhrasesResponse>(`/daily-phrase/keyword/${keyword}`);
  return response.data;
};

// Get stats
export const getStats = async (): Promise<StatsResponse> => {
  const response = await axiosInstance.get<StatsResponse>('/daily-phrase/stats/overview');
  return response.data;
};