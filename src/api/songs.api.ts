import axiosInstance from './axiosConfig';
import type {
  Song,
  CreateSongRequest,
  UpdateSongRequest,
  AddVocabularyRequest,
  AddKeyPhraseRequest,
  SongStats,
  UploadCoverResponse
} from '../types';

// Obtener todas las canciones del usuario
export const getAllSongs = async (params?: {
  topic?: string;
  isFavorite?: boolean;
  search?: string;
}): Promise<{ success: boolean; count: number; songs: Song[] }> => {
  const response = await axiosInstance.get('/songs', { params });
  return response.data;
};

// Crear nueva canción
export const createSong = async (data: CreateSongRequest): Promise<{ success: boolean; message: string; song: Song }> => {
  const response = await axiosInstance.post('/songs', data);
  return response.data;
};

// Obtener una canción específica
export const getSong = async (id: string): Promise<{ success: boolean; song: Song }> => {
  const response = await axiosInstance.get(`/songs/${id}`);
  return response.data;
};

// Actualizar canción
export const updateSong = async (
  id: string,
  data: UpdateSongRequest
): Promise<{ success: boolean; message: string; song: Song }> => {
  const response = await axiosInstance.put(`/songs/${id}`, data);
  return response.data;
};

// Eliminar canción
export const deleteSong = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete(`/songs/${id}`);
  return response.data;
};

// Toggle favorito
export const toggleSongFavorite = async (id: string): Promise<{ success: boolean; message: string; song: Song }> => {
  const response = await axiosInstance.put(`/songs/${id}/favorite`);
  return response.data;
};

// Obtener canciones por tema
export const getSongsByTopic = async (topicName: string): Promise<{ success: boolean; topic: string; count: number; songs: Song[] }> => {
  const response = await axiosInstance.get(`/songs/topic/${topicName}`);
  return response.data;
};

// Agregar vocabulario anotado
export const addAnnotatedWord = async (
  id: string,
  data: AddVocabularyRequest
): Promise<{ success: boolean; message: string; song: Song }> => {
  const response = await axiosInstance.post(`/songs/${id}/vocabulary`, data);
  return response.data;
};

// Agregar frase clave
export const addKeyPhrase = async (
  id: string,
  data: AddKeyPhraseRequest
): Promise<{ success: boolean; message: string; song: Song }> => {
  const response = await axiosInstance.post(`/songs/${id}/phrases`, data);
  return response.data;
};

// Obtener estadísticas de canciones
export const getSongStats = async (): Promise<{ success: boolean; stats: SongStats }> => {
  const response = await axiosInstance.get('/songs/stats/overview');
  return response.data;
};

// Subir portada de la canción
export const uploadCoverImage = async (id: string, file: File): Promise<UploadCoverResponse> => {
  const formData = new FormData();
  formData.append('coverImage', file);

  const response = await axiosInstance.post(`/songs/${id}/upload-cover`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};