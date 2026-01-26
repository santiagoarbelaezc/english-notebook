import React, { useState, useEffect } from 'react';
import {
  getAllConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  toggleConversationFavorite,
  toggleConversationArchived,
  getConversationStats,
  createMessage,
  getMessages,
  updateMessage,
  deleteMessage
} from '../../api/conversations.api';
import type {
  Conversation,
  Message,
  CreateConversationRequest,
  UpdateConversationRequest,
  ConversationStats
} from '../../types/conversation.types';
import { tokenService } from '../../services/token.service';
import styles from './Conversations.module.css';

export const Conversations: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [editingConversation, setEditingConversation] = useState<Conversation | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'you' | 'other'>('you');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showMessageActions, setShowMessageActions] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [sortBy, setSortBy] = useState<'title' | 'topic' | 'createdAt' | 'messageCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    console.log('🔍 Conversations component mounted');
    console.log('🔑 Token available:', !!tokenService.getAccessToken());
    loadConversations();
    loadStats();
  }, []);

  useEffect(() => {
    filterAndSortConversations();
  }, [conversations, searchTerm, topicFilter, showFavoritesOnly, showArchivedOnly, sortBy, sortOrder]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (topicFilter) params.topic = topicFilter;
      if (showFavoritesOnly) params.isFavorite = true;
      if (showArchivedOnly) params.isArchived = true;

      console.log('📡 Loading conversations with params:', params);
      const response = await getAllConversations(params);
      setConversations(response.conversations);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error loading conversations:', err);
      
      // Specific authentication error handling
      if (err.response?.status === 401 || err.message?.includes('token') || err.message?.includes('Sesión')) {
        setError('Your session has expired. Redirecting to login...');
        setTimeout(() => {
          tokenService.clearTokens();
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.message || 'Failed to load conversations');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getConversationStats();
      setStats(response.stats);
    } catch (err: any) {
      console.error('❌ Error loading statistics:', err);
    }
  };

  const filterAndSortConversations = () => {
    let filtered = [...conversations];

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(conversation =>
        conversation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (topicFilter) {
      filtered = filtered.filter(conversation => conversation.topic === topicFilter);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(conversation => conversation.isFavorite);
    }

    if (showArchivedOnly) {
      filtered = filtered.filter(conversation => conversation.isArchived);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'topic':
          comparison = a.topic.localeCompare(b.topic);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'messageCount':
          comparison = a.messageCount - b.messageCount;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredConversations(filtered);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentConversations = filteredConversations.slice(indexOfFirstItem, indexOfLastItem);

  const handleDeleteConversation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation(id);
        await loadConversations();
        await loadStats();
      } catch (err: any) {
        console.error('❌ Error deleting conversation:', err);
        handleAuthError(err);
      }
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleConversationFavorite(id);
      await loadConversations();
      await loadStats();
    } catch (err: any) {
      console.error('❌ Error toggling favorite:', err);
      handleAuthError(err);
    }
  };

  const handleToggleArchived = async (id: string) => {
    try {
      await toggleConversationArchived(id);
      await loadConversations();
      await loadStats();
    } catch (err: any) {
      console.error('❌ Error toggling archived:', err);
      handleAuthError(err);
    }
  };

  // Function to handle authentication errors
  const handleAuthError = (err: any) => {
    if (err.response?.status === 401 || 
        err.message?.includes('token') || 
        err.message?.includes('Sesión') ||
        err.message?.includes('No autorizado')) {
      setError('Your session has expired. Redirecting to login...');
      setTimeout(() => {
        tokenService.clearTokens();
        window.location.href = '/login';
      }, 2000);
    } else {
      setError(err.message || 'Operation error');
    }
  };

  const handleCreateConversation = async (conversationData: CreateConversationRequest | UpdateConversationRequest) => {
    console.log('📝 Attempting to create conversation with data:', conversationData);
    console.log('🔑 Token:', tokenService.getAccessToken()?.substring(0, 20) + '...');
    
    try {
      setIsCreating(true);
      setError(null); // Clear previous errors
      
      const result = await createConversation(conversationData as CreateConversationRequest);
      console.log('✅ Conversation created:', result);
      
      if (result?.conversation) {
        setShowCreateForm(false);
        await loadConversations();
        await loadStats();
      } else {
        throw new Error('No conversation received');
      }
      
    } catch (err: any) {
      console.error('❌ Complete error creating conversation:', err);
      console.error('❌ Response data:', err.response?.data);
      console.error('❌ Response status:', err.response?.status);
      
      // Specific error handling
      handleAuthError(err);
      
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateConversation = async (id: string, conversationData: UpdateConversationRequest) => {
    try {
      setIsUpdating(true);
      setError(null);
      await updateConversation(id, conversationData);
      setEditingConversation(null);
      await loadConversations();
    } catch (err: any) {
      console.error('❌ Error updating conversation:', err);
      handleAuthError(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversationModal(true);
    try {
      const response = await getMessages(conversation._id);
      setMessages(response.messages);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      handleAuthError(err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      setIsSendingMessage(true);
      setError(null);
      await createMessage(selectedConversation._id, {
        content: newMessage.trim(),
        role: selectedRole
      });
      setNewMessage('');

      // Reload messages
      const response = await getMessages(selectedConversation._id);
      setMessages(response.messages);

      // Reload conversations to update message count
      await loadConversations();
    } catch (err: any) {
      console.error('Error sending message:', err);
      handleAuthError(err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleUpdateMessage = async (messageId: string, updatedContent: string) => {
    if (!selectedConversation || !updatedContent.trim()) return;

    try {
      await updateMessage(selectedConversation._id, messageId, {
        content: updatedContent.trim(),
        role: editingMessage?.role || 'you'
      });
      
      setEditingMessage(null);
      
      // Reload messages
      const response = await getMessages(selectedConversation._id);
      setMessages(response.messages);
    } catch (err: any) {
      console.error('Error updating message:', err);
      handleAuthError(err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConversation || !window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await deleteMessage(selectedConversation._id, messageId);
      
      // Reload messages
      const response = await getMessages(selectedConversation._id);
      setMessages(response.messages);
      
      // Reload conversations to update message count
      await loadConversations();
    } catch (err: any) {
      console.error('Error deleting message:', err);
      handleAuthError(err);
    }
  };

  const handleSortChange = (newSortBy: 'title' | 'topic' | 'createdAt' | 'messageCount') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          ‹
        </button>

        {pageNumbers.map(number => (
          <button
            key={number}
            className={`${styles.pageBtn} ${currentPage === number ? styles.active : ''}`}
            onClick={() => setCurrentPage(number)}
          >
            {number}
          </button>
        ))}

        <button
          className={styles.pageBtn}
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          ›
        </button>
      </div>
    );
  };

  if (loading && conversations.length === 0) {
    return <div className={styles.loading}>Loading conversations...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>💬 Conversations</h1>
        <p className={styles.subtitle}>Practice and improve your English conversation skills</p>
      </div>

      {stats && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💬</div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Total Conversations</h3>
              <p className={styles.statValue}>{stats.totalConversations}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Favorites</h3>
              <p className={styles.statValue}>{stats.favoriteConversations}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📦</div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Archived</h3>
              <p className={styles.statValue}>{stats.archivedConversations}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💭</div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Total Messages</h3>
              <p className={styles.statValue}>{stats.totalMessages}</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Topics</option>
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="business">Business</option>
            <option value="travel">Travel</option>
            <option value="daily-life">Daily Life</option>
            <option value="interview">Interview</option>
            <option value="other">Other</option>
          </select>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            />
            Favorites only
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showArchivedOnly}
              onChange={(e) => setShowArchivedOnly(e.target.checked)}
            />
            Archived only
          </label>
        </div>

        <button
          className={styles.primaryButton}
          onClick={() => setShowCreateForm(true)}
          disabled={isCreating}
        >
          + New Conversation
        </button>
      </div>

      {error && (
        <div className={`${styles.error} ${error.includes('Redirigiendo') ? styles.sessionError : ''}`}>
          {error}
        </div>
      )}

      <div className={styles.resultsInfo}>
        <span>{filteredConversations.length} conversations found</span>
        <div className={styles.sortControls}>
          <span>Sort by:</span>
          <button
            className={`${styles.sortBtn} ${sortBy === 'createdAt' ? styles.active : ''}`}
            onClick={() => handleSortChange('createdAt')}
          >
            Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`${styles.sortBtn} ${sortBy === 'title' ? styles.active : ''}`}
            onClick={() => handleSortChange('title')}
          >
            Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`${styles.sortBtn} ${sortBy === 'topic' ? styles.active : ''}`}
            onClick={() => handleSortChange('topic')}
          >
            Topic {sortBy === 'topic' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`${styles.sortBtn} ${sortBy === 'messageCount' ? styles.active : ''}`}
            onClick={() => handleSortChange('messageCount')}
          >
            Messages {sortBy === 'messageCount' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.conversationsList}>
          {currentConversations.map((conversation) => (
            <ConversationCard
              key={conversation._id}
              conversation={conversation}
              onEdit={() => setEditingConversation(conversation)}
              onDelete={() => handleDeleteConversation(conversation._id)}
              onToggleFavorite={() => handleToggleFavorite(conversation._id)}
              onToggleArchived={() => handleToggleArchived(conversation._id)}
              onSelect={() => handleSelectConversation(conversation)}
              isSelected={false}
            />
          ))}
        </div>
      </div>

      {renderPagination()}

      {filteredConversations.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <h3>No conversations found</h3>
          <p>Start a new conversation to practice your English!</p>
          <button
            className={styles.primaryButton}
            onClick={() => setShowCreateForm(true)}
            disabled={isCreating}
          >
            Create your first conversation
          </button>
        </div>
      )}

      {showCreateForm && (
        <ConversationFormModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateConversation}
          title="Create New Conversation"
          isLoading={isCreating}
        />
      )}

      {editingConversation && (
        <ConversationFormModal
          conversation={editingConversation}
          onClose={() => setEditingConversation(null)}
          onSubmit={(data) => handleUpdateConversation(editingConversation._id, data)}
          title="Edit Conversation"
          isLoading={isUpdating}
        />
      )}

      {showConversationModal && selectedConversation && (
        <ConversationModal
          conversation={selectedConversation}
          messages={messages}
          onClose={() => {
            setShowConversationModal(false);
            setSelectedConversation(null);
            setMessages([]);
            setEditingMessage(null);
            setShowMessageActions(null);
            setNewMessage('');
          }}
          onSendMessage={handleSendMessage}
          onUpdateMessage={handleUpdateMessage}
          onDeleteMessage={handleDeleteMessage}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          isSendingMessage={isSendingMessage}
          editingMessage={editingMessage}
          setEditingMessage={setEditingMessage}
          showMessageActions={showMessageActions}
          setShowMessageActions={setShowMessageActions}
        />
      )}
    </div>
  );
};

interface ConversationCardProps {
  conversation: Conversation;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onToggleArchived: () => void;
  onSelect: () => void;
  isSelected: boolean;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleArchived,
  onSelect,
  isSelected
}) => {
  return (
    <div className={`${styles.conversationCard} ${isSelected ? styles.selected : ''}`} onClick={onSelect}>
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <span className={`${styles.topicBadge} ${styles[conversation.topic]}`}>
            {conversation.topic.replace('-', ' ')}
          </span>
          <span className={styles.messageCount}>
            {conversation.messageCount} messages
          </span>
        </div>
        <div className={styles.cardActions}>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={`${styles.actionBtn} ${conversation.isFavorite ? styles.active : ''}`}
            title={conversation.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            ⭐
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleArchived(); }}
            className={`${styles.actionBtn} ${conversation.isArchived ? styles.active : ''}`}
            title={conversation.isArchived ? 'Unarchive' : 'Archive'}
          >
            📦
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className={styles.actionBtn}
            title="Edit conversation"
          >
            ✏️
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className={styles.actionBtn}
            title="Delete conversation"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{conversation.title}</h3>
        {conversation.description && (
          <p className={styles.cardDescription}>{conversation.description}</p>
        )}
        <div className={styles.cardFooter}>
          <span className={styles.cardDate}>
            {new Date(conversation.createdAt).toLocaleDateString('en-US')}
          </span>
          {conversation.lastMessageDate && (
            <span className={styles.lastMessage}>
              Last: {new Date(conversation.lastMessageDate).toLocaleDateString('en-US')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface ConversationFormModalProps {
  conversation?: Conversation;
  onClose: () => void;
  onSubmit: (data: CreateConversationRequest | UpdateConversationRequest) => Promise<void>;
  title: string;
  isLoading?: boolean;
}

const ConversationFormModal: React.FC<ConversationFormModalProps> = ({
  conversation,
  onClose,
  onSubmit,
  title,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateConversationRequest>({
    title: '',
    description: '',
    topic: 'casual'
  });

  useEffect(() => {
    if (conversation) {
      setFormData({
        title: conversation.title,
        description: conversation.description,
        topic: conversation.topic
      });
    }
  }, [conversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      // The error will be handled by the parent component
    }
  };

  const handleInputChange = (field: keyof CreateConversationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              minLength={3}
              maxLength={200}
              placeholder="Enter the conversation title"
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              maxLength={1000}
              placeholder="Enter a description (optional)"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="topic">Topic</label>
            <select
              id="topic"
              value={formData.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              disabled={isLoading}
            >
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="business">Business</option>
              <option value="travel">Travel</option>
              <option value="daily-life">Daily Life</option>
              <option value="interview">Interview</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <button 
              type="button" 
              onClick={onClose} 
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading || !formData.title.trim()} 
              className={styles.submitButton}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ConversationModalProps {
  conversation: Conversation;
  messages: Message[];
  onClose: () => void;
  onSendMessage: () => void;
  onUpdateMessage: (messageId: string, content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  selectedRole: 'you' | 'other';
  setSelectedRole: (role: 'you' | 'other') => void;
  isSendingMessage: boolean;
  editingMessage: Message | null;
  setEditingMessage: (message: Message | null) => void;
  showMessageActions: string | null;
  setShowMessageActions: (id: string | null) => void;
}

const ConversationModal: React.FC<ConversationModalProps> = ({
  conversation,
  messages,
  onClose,
  onSendMessage,
  onUpdateMessage,
  onDeleteMessage,
  newMessage,
  setNewMessage,
  selectedRole,
  setSelectedRole,
  isSendingMessage,
  editingMessage,
  setEditingMessage,
  showMessageActions,
  setShowMessageActions
}) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
    <div className={`${styles.modal} ${styles.conversationModal}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2>{conversation.title}</h2>
            <p>{conversation.description}</p>
            <span className={`${styles.topicBadge} ${styles[conversation.topic]}`}>
              {conversation.topic.replace('-', ' ')}
            </span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <div
              key={message._id}
              className={`${styles.message} ${styles[message.role]}`}
              onDoubleClick={() => {
                if (message.role === selectedRole) {
                  setEditingMessage(message);
                }
              }}
              onMouseEnter={() => setShowMessageActions(message._id)}
              onMouseLeave={() => setShowMessageActions(null)}
            >
              <div className={styles.messageHeader}>
                <span className={styles.messageRole}>
                  {message.role === 'you' ? '👤 You' : '🤖 Other'}
                </span>
                {showMessageActions === message._id && (
                  <div className={styles.messageActions}>
                    {message.role === selectedRole && (
                      <button
                        className={styles.messageActionBtn}
                        onClick={() => setEditingMessage(message)}
                        title="Edit message"
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      className={styles.messageActionBtn}
                      onClick={() => onDeleteMessage(message._id)}
                      title="Delete message"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              
              {editingMessage?._id === message._id ? (
                <div className={styles.messageEditForm}>
                  <textarea
                    value={editingMessage.content}
                    onChange={(e) => setEditingMessage({
                      ...editingMessage,
                      content: e.target.value
                    })}
                    className={styles.messageEditInput}
                    rows={3}
                    autoFocus
                  />
                  <div className={styles.messageEditActions}>
                    <button
                      onClick={() => onUpdateMessage(message._id, editingMessage.content)}
                      className={styles.saveEditBtn}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingMessage(null)}
                      className={styles.cancelEditBtn}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.messageContent}>
                  {message.content}
                </div>
              )}
              
              {message.correction && (
                <div className={styles.correction}>
                  <small>💡 {message.correction.explanation}</small>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.messageInputContainer}>
          <div className={styles.roleSelector}>
            <span>Write as:</span>
            <div className={styles.roleButtons}>
              <button
                className={`${styles.roleBtn} ${selectedRole === 'you' ? styles.active : ''}`}
                onClick={() => setSelectedRole('you')}
              >
                👤 You
              </button>
              <button
                className={`${styles.roleBtn} ${selectedRole === 'other' ? styles.active : ''}`}
                onClick={() => setSelectedRole('other')}
              >
                🤖 Other
              </button>
            </div>
          </div>
          
          <div className={styles.messageInput}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Write a message as ${selectedRole === 'you' ? 'you' : 'the other'}...`}
              rows={3}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
            />
            <button
              onClick={onSendMessage}
              disabled={!newMessage.trim() || isSendingMessage}
              className={styles.sendButton}
            >
              {isSendingMessage ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversations;