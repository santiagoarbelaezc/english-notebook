export type AchievementType =
    | 'vocabulary'
    | 'grammar'
    | 'conversation'
    | 'reading'
    | 'milestone'
    | 'streak'
    | 'custom';

export interface AchievementDetails {
    value?: number;   // e.g. 50 words learned
    target?: number;  // e.g. 100 words
    unit?: string;    // e.g. "words", "days"
}

export interface Achievement {
    _id: string;
    user: string;
    title: string;
    description: string;
    type: AchievementType;
    icon: string;
    unlockedDate: string;
    details: AchievementDetails;
    progress: number;      // 0-100
    points: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

// --- Request types ---

export interface CreateAchievementRequest {
    title: string;
    description?: string;
    type: AchievementType;
    icon?: string;
    details?: AchievementDetails;
    progress?: number;
    points?: number;
    notes?: string;
}

export interface UpdateAchievementRequest {
    title?: string;
    description?: string;
    icon?: string;
    details?: AchievementDetails;
    progress?: number;
    points?: number;
    notes?: string;
}

export interface UpdateProgressRequest {
    progress: number;
}

export interface GetAllAchievementsParams {
    type?: AchievementType;
    search?: string;
}

// --- Response types ---

export interface AchievementsResponse {
    success: boolean;
    count: number;
    achievements: Achievement[];
}

export interface AchievementResponse {
    success: boolean;
    message?: string;
    achievement: Achievement;
}

export interface AchievementDeleteResponse {
    success: boolean;
    message: string;
}

export interface AchievementStatsResponse {
    success: boolean;
    stats: {
        totalAchievements: number;
        completedAchievements: number;
        totalPoints: number;
        averageProgress: number | string;
        byType: Array<{ _id: string; count: number }>;
    };
}
