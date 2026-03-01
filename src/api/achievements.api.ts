import axiosInstance from './axiosConfig';
import type {
    AchievementsResponse,
    AchievementByCategoryResponse,
    AchievementStatsResponse,
    AchievementCategory,
} from '../types';

// Get all achievements (with optional filters)
export const getAllAchievements = async (params?: {
    category?: AchievementCategory;
    unlocked?: boolean;
}): Promise<AchievementsResponse> => {
    const response = await axiosInstance.get<AchievementsResponse>('/achievements', { params });
    return response.data;
};

// Get achievements by category
export const getAchievementsByCategory = async (category: AchievementCategory): Promise<AchievementByCategoryResponse> => {
    const response = await axiosInstance.get<AchievementByCategoryResponse>(`/achievements/category/${category}`);
    return response.data;
};

// Get achievement statistics
export const getAchievementStats = async (): Promise<AchievementStatsResponse> => {
    const response = await axiosInstance.get<AchievementStatsResponse>('/achievements/stats');
    return response.data;
};
