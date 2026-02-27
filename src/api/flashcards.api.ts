import axiosInstance from './axiosConfig';
import type {
    CreateFlashcardRequest,
    UpdateFlashcardRequest,
    GetAllFlashcardsParams,
    FlashcardsResponse,
    FlashcardResponse,
    FlashcardDeleteResponse,
    FlashcardDecksResponse,
    FlashcardStatsResponse,
} from '../types';

// Get all flashcards (with optional filters)
export const getAllFlashcards = async (params?: GetAllFlashcardsParams): Promise<FlashcardsResponse> => {
    const response = await axiosInstance.get<FlashcardsResponse>('/flashcards', { params });
    return response.data;
};

// Create a new flashcard
export const createFlashcard = async (data: CreateFlashcardRequest): Promise<FlashcardResponse> => {
    const response = await axiosInstance.post<FlashcardResponse>('/flashcards', data);
    return response.data;
};

// Get a specific flashcard by ID
export const getFlashcard = async (id: string): Promise<FlashcardResponse> => {
    const response = await axiosInstance.get<FlashcardResponse>(`/flashcards/${id}`);
    return response.data;
};

// Update a flashcard
export const updateFlashcard = async (id: string, data: UpdateFlashcardRequest): Promise<FlashcardResponse> => {
    const response = await axiosInstance.put<FlashcardResponse>(`/flashcards/${id}`, data);
    return response.data;
};

// Delete a flashcard
export const deleteFlashcard = async (id: string): Promise<FlashcardDeleteResponse> => {
    const response = await axiosInstance.delete<FlashcardDeleteResponse>(`/flashcards/${id}`);
    return response.data;
};

// Toggle favorite
export const toggleFlashcardFavorite = async (id: string): Promise<FlashcardResponse> => {
    const response = await axiosInstance.put<FlashcardResponse>(`/flashcards/${id}/favorite`);
    return response.data;
};

// SRS: Mark as correct
export const markFlashcardCorrect = async (id: string): Promise<FlashcardResponse> => {
    const response = await axiosInstance.put<FlashcardResponse>(`/flashcards/${id}/review/correct`);
    return response.data;
};

// SRS: Mark as incorrect
export const markFlashcardIncorrect = async (id: string): Promise<FlashcardResponse> => {
    const response = await axiosInstance.put<FlashcardResponse>(`/flashcards/${id}/review/incorrect`);
    return response.data;
};

// SRS: Get next review cards
export const getNextReviewCards = async (params?: { deck?: string; limit?: number }): Promise<FlashcardsResponse> => {
    const response = await axiosInstance.get<FlashcardsResponse>('/flashcards/review/next-cards', { params });
    return response.data;
};

// Get flashcards by deck
export const getFlashcardsByDeck = async (deckName: string): Promise<FlashcardsResponse> => {
    const response = await axiosInstance.get<FlashcardsResponse>(`/flashcards/deck/${deckName}`);
    return response.data;
};

// Get flashcards by difficulty
export const getFlashcardsByDifficulty = async (level: string): Promise<FlashcardsResponse> => {
    const response = await axiosInstance.get<FlashcardsResponse>(`/flashcards/difficulty/${level}`);
    return response.data;
};

// Get all decks
export const getAllDecks = async (): Promise<FlashcardDecksResponse> => {
    const response = await axiosInstance.get<FlashcardDecksResponse>('/flashcards/decks/list/all');
    return response.data;
};

// Get flashcard statistics
export const getFlashcardStats = async (): Promise<FlashcardStatsResponse> => {
    const response = await axiosInstance.get<FlashcardStatsResponse>('/flashcards/stats/overview');
    return response.data;
};
