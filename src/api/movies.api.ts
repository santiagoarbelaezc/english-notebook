import axiosInstance from './axiosConfig';
import type {
    Movie,
    CreateMovieRequest,
    UpdateMovieRequest,
    AddQuoteRequest,
    MoviesResponse,
    MovieResponse,
    MovieStatsResponse
} from '../types';

// ── CRUD ─────────────────────────────────────────────────────────────────────

export const getAllMovies = async (params?: {
    isFavorite?: boolean;
    search?: string;
}): Promise<MoviesResponse> => {
    const response = await axiosInstance.get<MoviesResponse>('/movies', { params });
    return response.data;
};

export const getMovie = async (id: string): Promise<MovieResponse> => {
    const response = await axiosInstance.get<MovieResponse>(`/movies/${id}`);
    return response.data;
};

export const createMovie = async (data: CreateMovieRequest): Promise<MovieResponse> => {
    const response = await axiosInstance.post<MovieResponse>('/movies', data);
    return response.data;
};

export const updateMovie = async (id: string, data: UpdateMovieRequest): Promise<MovieResponse> => {
    const response = await axiosInstance.put<MovieResponse>(`/movies/${id}`, data);
    return response.data;
};

export const deleteMovie = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete<{ success: boolean; message: string }>(`/movies/${id}`);
    return response.data;
};

// ── Actions ──────────────────────────────────────────────────────────────────

export const toggleMovieFavorite = async (id: string): Promise<MovieResponse> => {
    const response = await axiosInstance.put<MovieResponse>(`/movies/${id}/favorite`);
    return response.data;
};

export const uploadMoviePoster = async (id: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('posterImage', file);
    const response = await axiosInstance.post(`/movies/${id}/upload-poster`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// ── Quotes ───────────────────────────────────────────────────────────────────

export const getMovieQuotes = async (id: string): Promise<any> => {
    const response = await axiosInstance.get(`/movies/${id}/quotes`);
    return response.data;
};

export const addMovieQuote = async (id: string, data: AddQuoteRequest): Promise<MovieResponse> => {
    const response = await axiosInstance.post<MovieResponse>(`/movies/${id}/quotes`, data);
    return response.data;
};

export const updateMovieQuote = async (movieId: string, quoteIndex: number, data: AddQuoteRequest): Promise<MovieResponse> => {
    const response = await axiosInstance.put<MovieResponse>(`/movies/${movieId}/quotes/${quoteIndex}`, data);
    return response.data;
};

export const deleteMovieQuote = async (movieId: string, quoteIndex: number): Promise<MovieResponse> => {
    const response = await axiosInstance.delete<MovieResponse>(`/movies/${movieId}/quotes/${quoteIndex}`);
    return response.data;
};

// ── Filters & Stats ──────────────────────────────────────────────────────────

export const getFavoriteMovies = async (): Promise<MoviesResponse> => {
    const response = await axiosInstance.get<MoviesResponse>('/movies/favorites/list');
    return response.data;
};

export const getMovieStats = async (): Promise<MovieStatsResponse> => {
    const response = await axiosInstance.get<MovieStatsResponse>('/movies/stats/overview');
    return response.data;
};
