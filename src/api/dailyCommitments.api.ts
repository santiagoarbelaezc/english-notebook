import axiosInstance from './axiosConfig';
import type {
    CreateCommitmentRequest,
    UpdateCommitmentRequest,
    UpdateCommitmentProgressRequest,
    UpdateCommitmentStatusRequest,
    GetAllCommitmentsParams,
    CommitmentsResponse,
    CommitmentResponse,
    CommitmentDeleteResponse,
    CommitmentStatsResponse,
} from '../types';

// Get all commitments (with optional filters)
export const getAllCommitments = async (params?: GetAllCommitmentsParams): Promise<CommitmentsResponse> => {
    const response = await axiosInstance.get<CommitmentsResponse>('/daily-commitments', { params });
    return response.data;
};

// Create a new commitment
export const createCommitment = async (data: CreateCommitmentRequest): Promise<CommitmentResponse> => {
    const response = await axiosInstance.post<CommitmentResponse>('/daily-commitments', data);
    return response.data;
};

// Get a specific commitment by ID
export const getCommitment = async (id: string): Promise<CommitmentResponse> => {
    const response = await axiosInstance.get<CommitmentResponse>(`/daily-commitments/${id}`);
    return response.data;
};

// Update a commitment
export const updateCommitment = async (id: string, data: UpdateCommitmentRequest): Promise<CommitmentResponse> => {
    const response = await axiosInstance.put<CommitmentResponse>(`/daily-commitments/${id}`, data);
    return response.data;
};

// Delete a commitment
export const deleteCommitment = async (id: string): Promise<CommitmentDeleteResponse> => {
    const response = await axiosInstance.delete<CommitmentDeleteResponse>(`/daily-commitments/${id}`);
    return response.data;
};

// Update commitment progress
export const updateCommitmentProgress = async (id: string, data: UpdateCommitmentProgressRequest): Promise<CommitmentResponse> => {
    const response = await axiosInstance.put<CommitmentResponse>(`/daily-commitments/${id}/progress`, data);
    return response.data;
};

// Update commitment status
export const updateCommitmentStatus = async (id: string, data: UpdateCommitmentStatusRequest): Promise<CommitmentResponse> => {
    const response = await axiosInstance.put<CommitmentResponse>(`/daily-commitments/${id}/status`, data);
    return response.data;
};

// Get today's commitments
export const getTodayCommitments = async (): Promise<CommitmentsResponse> => {
    const response = await axiosInstance.get<CommitmentsResponse>('/daily-commitments/today/commitments');
    return response.data;
};

// Get commitments by status
export const getCommitmentsByStatus = async (statusType: string): Promise<CommitmentsResponse> => {
    const response = await axiosInstance.get<CommitmentsResponse>(`/daily-commitments/status/${statusType}`);
    return response.data;
};

// Get commitment statistics
export const getCommitmentStats = async (): Promise<CommitmentStatsResponse> => {
    const response = await axiosInstance.get<CommitmentStatsResponse>('/daily-commitments/stats/overview');
    return response.data;
};
