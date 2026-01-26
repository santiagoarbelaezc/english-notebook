export interface Conversation {
  _id: string;
  user: string;
  title: string;
  description: string;
  topic: 'casual' | 'formal' | 'business' | 'travel' | 'daily-life' | 'interview' | 'other';
  messages: string[]; // Array de ObjectIds
  messageCount: number;
  lastMessageDate: string | null;
  isArchived: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  user: string;
  content: string;
  role: 'you' | 'other';
  correction?: {
    text?: string;
    explanation?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CreateConversationRequest {
  title: string;
  description?: string;
  topic?: 'casual' | 'formal' | 'business' | 'travel' | 'daily-life' | 'interview' | 'other';
}

export interface UpdateConversationRequest {
  title?: string;
  description?: string;
  topic?: 'casual' | 'formal' | 'business' | 'travel' | 'daily-life' | 'interview' | 'other';
}

export interface CreateMessageRequest {
  content: string;
  role: 'you' | 'other';
  correction?: {
    text?: string;
    explanation?: string;
  };
}

export interface UpdateMessageRequest {
  content?: string;
  role?: 'you' | 'other';
  correction?: {
    text?: string;
    explanation?: string;
  };
}

export interface ConversationsResponse {
  conversations: Conversation[];
  count: number;
}

export interface ConversationResponse {
  conversation: Conversation;
}

export interface MessagesResponse {
  messages: Message[];
  count: number;
}

export interface MessageResponse {
  message: Message;
}

export interface ConversationStats {
  totalConversations: number;
  favoriteConversations: number;
  archivedConversations: number;
  totalMessages: number;
  byTopic: Array<{
    _id: string;
    count: number;
  }>;
}

export interface ConversationStatsResponse {
  stats: ConversationStats;
}
