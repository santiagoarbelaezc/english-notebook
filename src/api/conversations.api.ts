import axiosConfig from './axiosConfig';
import type {
  CreateConversationRequest,
  UpdateConversationRequest,
  CreateMessageRequest,
  UpdateMessageRequest,
  ConversationsResponse,
  ConversationResponse,
  MessagesResponse,
  MessageResponse,
  ConversationStatsResponse
} from '../types/conversation.types';

// ============================================
// CONVERSACIONES
// ============================================

export const getAllConversations = async (params?: {
  topic?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  search?: string;
}): Promise<ConversationsResponse> => {
  const response = await axiosConfig.get('/conversations', { params });
  // El backend devuelve { success: true, conversations: [...], count: X }
  return {
    conversations: response.data.conversations || [],
    count: response.data.count || 0
  };
};

export const createConversation = async (data: CreateConversationRequest): Promise<ConversationResponse> => {
  const response = await axiosConfig.post('/conversations', data);
  // El backend devuelve { success: true, message: '...', conversation: {...} }
  return {
    conversation: response.data.conversation
  };
};

export const getConversation = async (id: string): Promise<ConversationResponse> => {
  const response = await axiosConfig.get(`/conversations/${id}`);
  // El backend devuelve { success: true, conversation: {...} }
  return {
    conversation: response.data.conversation
  };
};

export const updateConversation = async (id: string, data: UpdateConversationRequest): Promise<ConversationResponse> => {
  const response = await axiosConfig.put(`/conversations/${id}`, data);
  // El backend devuelve { success: true, message: '...', conversation: {...} }
  return {
    conversation: response.data.conversation
  };
};

export const deleteConversation = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosConfig.delete(`/conversations/${id}`);
  // El backend devuelve { success: true, message: '...' }
  return {
    success: response.data.success,
    message: response.data.message
  };
};

export const toggleConversationFavorite = async (id: string): Promise<ConversationResponse> => {
  const response = await axiosConfig.put(`/conversations/${id}/favorite`);
  // El backend devuelve { success: true, message: '...', conversation: {...} }
  return {
    conversation: response.data.conversation
  };
};

export const toggleConversationArchived = async (id: string): Promise<ConversationResponse> => {
  const response = await axiosConfig.put(`/conversations/${id}/archived`);
  // El backend devuelve { success: true, message: '...', conversation: {...} }
  return {
    conversation: response.data.conversation
  };
};

export const getConversationStats = async (): Promise<ConversationStatsResponse> => {
  const response = await axiosConfig.get('/conversations/stats/overview');
  // El backend devuelve { success: true, stats: {...} }
  return {
    stats: response.data.stats
  };
};

// ============================================
// MENSAJES
// ============================================

export const createMessage = async (conversationId: string, data: CreateMessageRequest): Promise<MessageResponse> => {
  const response = await axiosConfig.post(`/conversations/${conversationId}/messages`, data);
  // El backend devuelve { success: true, message: '...', data: {...} }
  return {
    message: response.data.data
  };
};

export const getMessages = async (conversationId: string): Promise<MessagesResponse> => {
  const response = await axiosConfig.get(`/conversations/${conversationId}/messages`);
  // El backend devuelve { success: true, count: X, messages: [...] }
  return {
    messages: response.data.messages || [],
    count: response.data.count || 0
  };
};

export const getMessage = async (conversationId: string, messageId: string): Promise<MessageResponse> => {
  const response = await axiosConfig.get(`/conversations/${conversationId}/messages/${messageId}`);
  // El backend devuelve { success: true, message: {...} }
  return {
    message: response.data.message
  };
};

export const updateMessage = async (conversationId: string, messageId: string, data: UpdateMessageRequest): Promise<MessageResponse> => {
  const response = await axiosConfig.put(`/conversations/${conversationId}/messages/${messageId}`, data);
  // El backend devuelve { success: true, message: '...', data: {...} }
  return {
    message: response.data.data
  };
};

export const deleteMessage = async (conversationId: string, messageId: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosConfig.delete(`/conversations/${conversationId}/messages/${messageId}`);
  // El backend devuelve { success: true, message: '...' }
  return {
    success: response.data.success,
    message: response.data.message
  };
};