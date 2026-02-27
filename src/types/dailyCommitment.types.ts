export type CommitmentType =
    | 'learn-words'
    | 'study-grammar'
    | 'practice-conversation'
    | 'read-text'
    | 'listen-song'
    | 'custom';

export type CommitmentUnit = 'palabras' | 'minutos' | 'reglas' | 'oraciones' | 'líneas' | 'custom';

export type CommitmentFrequency = 'daily' | 'weekly' | 'monthly';

export type CommitmentStatus = 'pending' | 'in-progress' | 'completed';

export interface CommitmentGoal {
    value: number;
    unit: CommitmentUnit;
}

export interface CommitmentProgress {
    current: number;
    percentage: number;
}

export interface CommitmentReminder {
    enabled: boolean;
    time?: string;
}

export interface DailyCommitment {
    _id: string;
    user: string;
    title: string;
    description: string;
    type: CommitmentType;
    goal: CommitmentGoal;
    progress: CommitmentProgress;
    reminder: CommitmentReminder;
    frequency: CommitmentFrequency;
    date: string;
    startDate: string;
    endDate?: string;
    status: CommitmentStatus;
    completedAt?: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

// Request types

export interface CreateCommitmentRequest {
    title: string;
    description?: string;
    type: CommitmentType;
    goal: CommitmentGoal;
    reminder?: CommitmentReminder;
    frequency?: CommitmentFrequency;
    endDate?: string;
    notes?: string;
}

export interface UpdateCommitmentRequest {
    title?: string;
    description?: string;
    type?: CommitmentType;
    goal?: Partial<CommitmentGoal>;
    reminder?: CommitmentReminder;
    frequency?: CommitmentFrequency;
    endDate?: string;
    notes?: string;
    status?: CommitmentStatus;
}

export interface UpdateCommitmentProgressRequest {
    current: number;
}

export interface UpdateCommitmentStatusRequest {
    status: CommitmentStatus;
}

export interface GetAllCommitmentsParams {
    type?: CommitmentType;
    status?: CommitmentStatus;
    frequency?: CommitmentFrequency;
    search?: string;
}

// Response types

export interface CommitmentsResponse {
    success: boolean;
    count: number;
    commitments: DailyCommitment[];
}

export interface CommitmentResponse {
    success: boolean;
    message?: string;
    commitment: DailyCommitment;
}

export interface CommitmentDeleteResponse {
    success: boolean;
    message: string;
}

export interface CommitmentStatsResponse {
    success: boolean;
    stats: {
        totalCommitments: number;
        completed: number;
        inProgress: number;
        pending: number;
        completionRate: string;
        averageProgress: number | string;
        byType: Array<{ _id: string; count: number }>;
    };
}
