// ── Movie Types ──────────────────────────────────────────────────────────────

export interface MovieQuote {
    text: string;
    translation: string;
    character: string;
    timestamp?: string;
}

export interface Movie {
    _id: string;
    user: string;
    title: string;
    opinion: string;
    posterImage: string | null;
    quotes: MovieQuote[];
    isFavorite: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMovieRequest {
    title: string;
    opinion: string;
    posterImage?: string;
    quotes?: MovieQuote[];
}

export interface UpdateMovieRequest {
    title?: string;
    opinion?: string;
    posterImage?: string;
    isFavorite?: boolean;
}

export interface AddQuoteRequest {
    text: string;
    translation?: string;
    character?: string;
    timestamp?: string;
}

export interface MoviesResponse {
    success: boolean;
    count: number;
    movies: Movie[];
}

export interface MovieResponse {
    success: boolean;
    movie: Movie;
    message?: string;
}

export interface MovieStatsResponse {
    success: boolean;
    stats: {
        totalMovies: number;
        favoriteMovies: number;
        moviesWithQuotes: number;
        totalQuotes: number;
        averageQuotesPerMovie: number;
    };
}
