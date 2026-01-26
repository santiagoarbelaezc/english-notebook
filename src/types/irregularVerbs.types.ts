export interface IrregularVerb {
  _id: string;
  user: string;
  infinitive: string;
  pastSimple: string;
  pastParticiple: string;
  pronunciation?: {
    infinitive?: string;
    pastSimple?: string;
    pastParticiple?: string;
  };
  examples: Array<{
    infinitive: string;
    pastSimple: string;
    pastParticiple: string;
  }>;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  notes: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIrregularVerbRequest {
  infinitive: string;
  pastSimple: string;
  pastParticiple: string;
  pronunciation?: {
    infinitive?: string;
    pastSimple?: string;
    pastParticiple?: string;
  };
  examples?: Array<{
    infinitive: string;
    pastSimple: string;
    pastParticiple: string;
  }>;
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  notes?: string;
}

export interface UpdateIrregularVerbRequest {
  infinitive?: string;
  pastSimple?: string;
  pastParticiple?: string;
  pronunciation?: {
    infinitive?: string;
    pastSimple?: string;
    pastParticiple?: string;
  };
  examples?: Array<{
    infinitive: string;
    pastSimple: string;
    pastParticiple: string;
  }>;
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  notes?: string;
  isFavorite?: boolean;
}

export interface IrregularVerbsResponse {
  success: boolean;
  count: number;
  verbs: IrregularVerb[];
}

export interface IrregularVerbResponse {
  success: boolean;
  verb: IrregularVerb;
}

export interface IrregularVerbStats {
  totalVerbs: number;
  favoriteVerbs: number;
  verbsWithExamples: number;
  byDifficulty: Array<{
    _id: string;
    count: number;
  }>;
}

export interface IrregularVerbStatsResponse {
  success: boolean;
  stats: IrregularVerbStats;
}

export interface ConjugationsResponse {
  success: boolean;
  conjugations: {
    infinitive: string;
    pastSimple: string;
    pastParticiple: string;
    pronunciation?: {
      infinitive?: string;
      pastSimple?: string;
      pastParticiple?: string;
    };
  };
}

export interface AddExampleRequest {
  infinitive: string;
  pastSimple: string;
  pastParticiple: string;
}