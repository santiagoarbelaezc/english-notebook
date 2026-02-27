import axiosInstance from './axiosConfig';
import type {
    CreateAchievementRequest,
    UpdateAchievementRequest,
    UpdateProgressRequest,
    GetAllAchievementsParams,
    AchievementsResponse,
    AchievementResponse,
    AchievementDeleteResponse,
    AchievementStatsResponse,
} from '../types';

// Get all achievements (with optional filters)
export const getAllAchievements = async (params?: GetAllAchievementsParams): Promise<AchievementsResponse> => {
    const response = await axiosInstance.get<AchievementsResponse>('/achievements', { params });
    return response.data;
};

// Create a new achievement
export const createAchievement = async (data: CreateAchievementRequest): Promise<AchievementResponse> => {
    const response = await axiosInstance.post<AchievementResponse>('/achievements', data);
    return response.data;
};

// Get a specific achievement by ID
export const getAchievement = async (id: string): Promise<AchievementResponse> => {
    const response = await axiosInstance.get<AchievementResponse>(`/achievements/${id}`);
    return response.data;
};

// Update an achievement
export const updateAchievement = async (id: string, data: UpdateAchievementRequest): Promise<AchievementResponse> => {
    const response = await axiosInstance.put<AchievementResponse>(`/achievements/${id}`, data);
    return response.data;
};

// Delete an achievement
export const deleteAchievement = async (id: string): Promise<AchievementDeleteResponse> => {
    const response = await axiosInstance.delete<AchievementDeleteResponse>(`/achievements/${id}`);
    return response.data;
};

// Update achievement progress
export const updateAchievementProgress = async (id: string, data: UpdateProgressRequest): Promise<AchievementResponse> => {
    const response = await axiosInstance.put<AchievementResponse>(`/achievements/${id}/progress`, data);
    return response.data;
};

// Get achievements by type
export const getAchievementsByType = async (achievementType: string): Promise<AchievementsResponse> => {
    const response = await axiosInstance.get<AchievementsResponse>(`/achievements/type/${achievementType}`);
    return response.data;
};

// Get in-progress achievements (progress > 0 && < 100)
export const getInProgressAchievements = async (): Promise<AchievementsResponse> => {
    const response = await axiosInstance.get<AchievementsResponse>('/achievements/status/in-progress');
    return response.data;
};

// Get achievement statistics
export const getAchievementStats = async (): Promise<AchievementStatsResponse> => {
    const response = await axiosInstance.get<AchievementStatsResponse>('/achievements/stats/overview');
    return response.data;
};
