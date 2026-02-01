export interface AnnotatedVocabulary {
  word: string;
  meaning: string;
  line?: number;
}

export interface KeyPhrase {
  phrase: string;
  meaning: string;
  explanation?: string;
}

export interface Song {
  _id: string;
  user: string;
  title: string;
  artist: string;
  coverImage?: string;
  lyrics: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  annotatedVocabulary: AnnotatedVocabulary[];
  keyPhrases: KeyPhrase[];
  topic: 'love' | 'motivation' | 'adventure' | 'daily-life' | 'nature' | 'friendship' | 'other';
  notes?: string;
  translation?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSongRequest {
  title: string;
  artist: string;
  lyrics: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  topic?: Song['topic'];
  notes?: string;
  translation?: string;
  coverImage?: string;
  annotatedVocabulary?: AnnotatedVocabulary[];
  keyPhrases?: KeyPhrase[];
}

export interface UpdateSongRequest {
  title?: string;
  artist?: string;
  lyrics?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  topic?: Song['topic'];
  notes?: string;
  translation?: string;
  coverImage?: string;
  annotatedVocabulary?: AnnotatedVocabulary[];
  keyPhrases?: KeyPhrase[];
  isFavorite?: boolean;
}

export interface AddVocabularyRequest {
  word: string;
  meaning: string;
  line?: number;
}

export interface AddKeyPhraseRequest {
  phrase: string;
  meaning: string;
  explanation?: string;
}

export interface SongStats {
  totalSongs: number;
  favoriteSongs: number;
  totalAnnotatedWords: number;
  byTopic: { _id: string; count: number }[];
}

export interface UploadCoverResponse {
  success: boolean;
  message: string;
  coverImage: {
    url: string;
    publicId: string;
    width: number;
    height: number;
  };
}