// ── Achievement Types (Auto-unlock system) ───────────────────────────────────

export type AchievementCategory =
    | 'vocabulary'
    | 'grammar'
    | 'conversation'
    | 'text'
    | 'song'
    | 'movie'
    | 'flashcard'
    | 'irregularVerb'
    | 'streak';

export interface Achievement {
    _id: string;
    user: string;
    category: AchievementCategory;
    milestone: number;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedDate: string | null;
    xpReward: number;
    progress?: number; // calculated by backend
    currentCount?: number; // current count for this category
    createdAt: string;
    updatedAt: string;
}

// --- Response types ---

export interface AchievementsResponse {
    success: boolean;
    count: number;
    totalUnlocked: number;
    achievements: Achievement[];
}

export interface AchievementByCategoryResponse {
    success: boolean;
    category: AchievementCategory;
    count: number;
    unlocked: number;
    achievements: Achievement[];
}

export interface CategoryStats {
    _id: AchievementCategory;
    total: number;
    unlocked: number;
}

export interface RecentAchievement {
    _id: string;
    title: string;
    icon: string;
    category: AchievementCategory;
    xpReward: number;
    unlockedDate: string;
}

export interface AchievementStatsResponse {
    success: boolean;
    stats: {
        totalAchievements: number;
        unlockedAchievements: number;
        completionPercentage: number;
        experience: number;
        level: number;
        totalXpFromAchievements: number;
        streak: {
            current: number;
            longest: number;
            lastLogin: string | null;
        };
        byCategory: CategoryStats[];
        recentAchievements: RecentAchievement[];
    };
}
