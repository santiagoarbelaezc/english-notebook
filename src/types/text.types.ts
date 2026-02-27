export type TextType =
    | 'article'
    | 'story'
    | 'news'
    | 'blog'
    | 'book-excerpt'
    | 'email'
    | 'letter'
    | 'poem'
    | 'other';

export type TextCategory =
    | 'daily-life'
    | 'business'
    | 'travel'
    | 'culture'
    | 'science'
    | 'history'
    | 'self-improvement'
    | 'other';

export interface TextAnnotatedVocabulary {
    word: string;
    meaning: string;
    position?: number;
}

export interface TextKeyExpression {
    expression: string;
    meaning: string;
}

export interface Text {
    _id: string;
    user: string;
    title: string;
    content: string;
    type: TextType;
    source: string;
    category: TextCategory;
    annotatedVocabulary: TextAnnotatedVocabulary[];
    keyExpressions: TextKeyExpression[];
    summary: string;
    notes: string;
    isFavorite: boolean;
    comprehensionNotes: string;
    createdAt: string;
    updatedAt: string;
}

// --- Request types ---

export interface CreateTextRequest {
    title: string;
    content: string;
    type?: TextType;
    source?: string;
    category?: TextCategory;
    annotatedVocabulary?: TextAnnotatedVocabulary[];
    keyExpressions?: TextKeyExpression[];
    summary?: string;
    notes?: string;
    comprehensionNotes?: string;
}

export interface UpdateTextRequest {
    title?: string;
    content?: string;
    type?: TextType;
    source?: string;
    category?: TextCategory;
    annotatedVocabulary?: TextAnnotatedVocabulary[];
    keyExpressions?: TextKeyExpression[];
    summary?: string;
    notes?: string;
    comprehensionNotes?: string;
    isFavorite?: boolean;
}

export interface AddTextAnnotatedVocabularyRequest {
    word: string;
    meaning: string;
    position?: number;
}

export interface AddTextKeyExpressionRequest {
    expression: string;
    meaning: string;
}

export interface GetAllTextsParams {
    type?: TextType;
    category?: TextCategory;
    isFavorite?: boolean;
    search?: string;
}

// --- Response types ---

export interface TextsResponse {
    success: boolean;
    count: number;
    texts: Text[];
}

export interface TextResponse {
    success: boolean;
    message?: string;
    text: Text;
}

export interface TextDeleteResponse {
    success: boolean;
    message: string;
}

export interface TextReadingSummaryResponse {
    success: boolean;
    summary: {
        title: string;
        type: TextType;
        category: TextCategory;
        wordCount: number;
        summary: string;
        comprehensionNotes: string;
        annotatedVocabularyCount: number;
        keyExpressionsCount: number;
        isFavorite: boolean;
        source: string;
    };
}

export interface TextStatsResponse {
    success: boolean;
    stats: {
        totalTexts: number;
        favoriteTexts: number;
        textsWithVocabulary: number;
        textsWithExpressions: number;
        totalAnnotatedWords: number;
        byType: Array<{ _id: string; count: number }>;
        byCategory: Array<{ _id: string; count: number }>;
    };
}
