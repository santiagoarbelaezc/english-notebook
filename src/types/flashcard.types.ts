export type FlashcardDifficulty = 'easy' | 'medium' | 'hard';

export interface FlashcardStatistics {
    timesReviewed: number;
    timesCorrect: number;
    timesIncorrect: number;
    lastReviewDate?: string;
    nextReviewDate?: string;
    interval: number;
}

export interface Flashcard {
    _id: string;
    user: string;
    front: string;
    back: string;
    deck: string;
    difficulty: FlashcardDifficulty;
    statistics: FlashcardStatistics;
    isFavorite: boolean;
    createdAt: string;
    updatedAt: string;
}

// Request types

export interface CreateFlashcardRequest {
    front: string;
    back: string;
    deck?: string;
    difficulty?: FlashcardDifficulty;
}

export interface UpdateFlashcardRequest {
    front?: string;
    back?: string;
    deck?: string;
    difficulty?: FlashcardDifficulty;
    isFavorite?: boolean;
}

export interface GetAllFlashcardsParams {
    deck?: string;
    difficulty?: FlashcardDifficulty;
    isFavorite?: string;
    search?: string;
}

// Response types

export interface FlashcardsResponse {
    success: boolean;
    count: number;
    flashcards: Flashcard[];
}

export interface FlashcardResponse {
    success: boolean;
    message?: string;
    flashcard: Flashcard;
}

export interface FlashcardDeleteResponse {
    success: boolean;
    message: string;
}

export interface FlashcardDecksResponse {
    success: boolean;
    count: number;
    decks: Array<{ _id: string; count: number }>;
}

export interface FlashcardStatsResponse {
    success: boolean;
    stats: {
        totalCards: number;
        favoriteCards: number;
        totalReviews: number;
        correctAnswers: number;
        incorrectAnswers: number;
        accuracyRate: string;
        byDifficulty: Array<{ _id: string; count: number }>;
    };
}
