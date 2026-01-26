import axiosInstance from './axiosConfig';
import type {
  CreateIrregularVerbRequest,
  UpdateIrregularVerbRequest,
  IrregularVerbsResponse,
  IrregularVerbResponse,
  IrregularVerbStatsResponse,
  ConjugationsResponse,
  AddExampleRequest
} from '../types';

// Get all irregular verbs
export const getAllIrregularVerbs = async (params?: {
  difficulty?: string;
  isFavorite?: boolean;
  search?: string;
}): Promise<IrregularVerbsResponse> => {
  const response = await axiosInstance.get<IrregularVerbsResponse>('/irregular-verbs', { params });
  return response.data;
};

// Create new irregular verb
export const createIrregularVerb = async (data: CreateIrregularVerbRequest): Promise<IrregularVerbResponse> => {
  const response = await axiosInstance.post<IrregularVerbResponse>('/irregular-verbs', data);
  return response.data;
};

// Get specific irregular verb
export const getIrregularVerb = async (id: string): Promise<IrregularVerbResponse> => {
  const response = await axiosInstance.get<IrregularVerbResponse>(`/irregular-verbs/${id}`);
  return response.data;
};

// Update irregular verb
export const updateIrregularVerb = async (id: string, data: UpdateIrregularVerbRequest): Promise<IrregularVerbResponse> => {
  const response = await axiosInstance.put<IrregularVerbResponse>(`/irregular-verbs/${id}`, data);
  return response.data;
};

// Delete irregular verb
export const deleteIrregularVerb = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete(`/irregular-verbs/${id}`);
  return response.data;
};

// Toggle favorite
export const toggleIrregularVerbFavorite = async (id: string): Promise<IrregularVerbResponse> => {
  const response = await axiosInstance.put<IrregularVerbResponse>(`/irregular-verbs/${id}/favorite`);
  return response.data;
};

// Get verbs by difficulty
export const getIrregularVerbsByDifficulty = async (level: string): Promise<IrregularVerbsResponse> => {
  const response = await axiosInstance.get<IrregularVerbsResponse>(`/irregular-verbs/difficulty/${level}`);
  return response.data;
};

// Add example
export const addIrregularVerbExample = async (id: string, data: AddExampleRequest): Promise<IrregularVerbResponse> => {
  const response = await axiosInstance.post<IrregularVerbResponse>(`/irregular-verbs/${id}/examples`, data);
  return response.data;
};

// Remove example
export const removeIrregularVerbExample = async (id: string, exampleIndex: number): Promise<IrregularVerbResponse> => {
  const response = await axiosInstance.delete<IrregularVerbResponse>(`/irregular-verbs/${id}/examples/${exampleIndex}`);
  return response.data;
};

// Get stats
export const getIrregularVerbsStats = async (): Promise<IrregularVerbStatsResponse> => {
  const response = await axiosInstance.get<IrregularVerbStatsResponse>('/irregular-verbs/stats/overview');
  return response.data;
};

// Get conjugations
export const getIrregularVerbConjugations = async (infinitive: string): Promise<ConjugationsResponse> => {
  const response = await axiosInstance.get<ConjugationsResponse>('/irregular-verbs/conjugations', {
    params: { infinitive }
  });
  return response.data;
};
