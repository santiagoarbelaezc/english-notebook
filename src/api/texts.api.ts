import axiosInstance from './axiosConfig';
import type {
    CreateTextRequest,
    UpdateTextRequest,
    AddTextAnnotatedVocabularyRequest,
    AddTextKeyExpressionRequest,
    GetAllTextsParams,
    TextsResponse,
    TextResponse,
    TextDeleteResponse,
    TextReadingSummaryResponse,
    TextStatsResponse,
} from '../types';

// Get all texts (with optional filters)
export const getAllTexts = async (params?: GetAllTextsParams): Promise<TextsResponse> => {
    const response = await axiosInstance.get<TextsResponse>('/texts', { params });
    return response.data;
};

// Create a new text
export const createText = async (data: CreateTextRequest): Promise<TextResponse> => {
    const response = await axiosInstance.post<TextResponse>('/texts', data);
    return response.data;
};

// Get a specific text by ID
export const getText = async (id: string): Promise<TextResponse> => {
    const response = await axiosInstance.get<TextResponse>(`/texts/${id}`);
    return response.data;
};

// Update a text
export const updateText = async (id: string, data: UpdateTextRequest): Promise<TextResponse> => {
    const response = await axiosInstance.put<TextResponse>(`/texts/${id}`, data);
    return response.data;
};

// Delete a text
export const deleteText = async (id: string): Promise<TextDeleteResponse> => {
    const response = await axiosInstance.delete<TextDeleteResponse>(`/texts/${id}`);
    return response.data;
};

// Toggle favorite status
export const toggleTextFavorite = async (id: string): Promise<TextResponse> => {
    const response = await axiosInstance.put<TextResponse>(`/texts/${id}/favorite`);
    return response.data;
};

// Get reading summary for a text
export const getTextReadingSummary = async (id: string): Promise<TextReadingSummaryResponse> => {
    const response = await axiosInstance.get<TextReadingSummaryResponse>(`/texts/${id}/summary`);
    return response.data;
};

// Add an annotated vocabulary word to a text
export const addTextAnnotatedVocabulary = async (
    id: string,
    data: AddTextAnnotatedVocabularyRequest
): Promise<TextResponse> => {
    const response = await axiosInstance.post<TextResponse>(`/texts/${id}/vocabulary`, data);
    return response.data;
};

// Add a key expression to a text
export const addTextKeyExpression = async (
    id: string,
    data: AddTextKeyExpressionRequest
): Promise<TextResponse> => {
    const response = await axiosInstance.post<TextResponse>(`/texts/${id}/expressions`, data);
    return response.data;
};

// Get texts filtered by type
export const getTextsByType = async (textType: string): Promise<TextsResponse> => {
    const response = await axiosInstance.get<TextsResponse>(`/texts/type/${textType}`);
    return response.data;
};

// Get texts filtered by category
export const getTextsByCategory = async (categoryName: string): Promise<TextsResponse> => {
    const response = await axiosInstance.get<TextsResponse>(`/texts/category/${categoryName}`);
    return response.data;
};

// Get text statistics overview
export const getTextStats = async (): Promise<TextStatsResponse> => {
    const response = await axiosInstance.get<TextStatsResponse>('/texts/stats/overview');
    return response.data;
};
