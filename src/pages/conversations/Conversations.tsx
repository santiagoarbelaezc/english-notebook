import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Filter,
  Layers,
  Activity,
  Star,
  Heart,
  Edit2,
  Trash2,
  Plus,
  X,
  MessageSquare,
  Archive,
  ChevronLeft,
  ChevronRight,
  Send,
  MoreVertical,
  Check,
  Save,
  AlertCircle,
  List,
  Calendar,
  User,
  History
} from 'lucide-react';
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
import huskyIcon from '../../assets/icons/husky.png';

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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState<'title' | 'topic' | 'createdAt' | 'messageCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAuthError = useCallback((err: any) => {
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
      showToast(err.message || 'Operation error', 'error');
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (topicFilter) params.topic = topicFilter;
      if (showFavoritesOnly) params.isFavorite = true;
      if (showArchivedOnly) params.isArchived = true;

      const response = await getAllConversations(params);
      setConversations(response.conversations);
      setError(null);
    } catch (err: any) {
      console.error('Error loading conversations:', err);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, topicFilter, showFavoritesOnly, showArchivedOnly, handleAuthError]);

  const loadStats = useCallback(async () => {
    try {
      const response = await getConversationStats();
      setStats(response.stats);
    } catch (err: any) {
      console.error('Error loading statistics:', err);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    loadStats();
  }, [loadConversations, loadStats]);

  const filterAndSortConversations = useCallback(() => {
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
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredConversations(filtered);
    setCurrentPage(1);
  }, [conversations, searchTerm, topicFilter, showFavoritesOnly, showArchivedOnly, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortConversations();
  }, [filterAndSortConversations]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentConversations = filteredConversations.slice(indexOfFirstItem, indexOfLastItem);

  const handleDeleteConversation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation(id);
        showToast('Conversation deleted');
        await loadConversations();
        await loadStats();
      } catch (err: any) {
        handleAuthError(err);
      }
    }
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleConversationFavorite(id);
      await loadConversations();
      await loadStats();
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const handleToggleArchived = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleConversationArchived(id);
      await loadConversations();
      await loadStats();
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const handleCreateConversation = async (conversationData: CreateConversationRequest) => {
    try {
      setIsCreating(true);
      setError(null);
      await createConversation(conversationData);
      showToast('Conversation created!');
      setShowCreateForm(false);
      await loadConversations();
      await loadStats();
    } catch (err: any) {
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
      showToast('Conversation updated!');
      setEditingConversation(null);
      await loadConversations();
    } catch (err: any) {
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
      handleAuthError(err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      setIsSendingMessage(true);
      await createMessage(selectedConversation._id, {
        content: newMessage.trim(),
        role: selectedRole
      });
      setNewMessage('');
      const response = await getMessages(selectedConversation._id);
      setMessages(response.messages);
      await loadConversations();
    } catch (err: any) {
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
      const response = await getMessages(selectedConversation._id);
      setMessages(response.messages);
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConversation || !window.confirm('Delete this message?')) return;

    try {
      await deleteMessage(selectedConversation._id, messageId);
      const response = await getMessages(selectedConversation._id);
      setMessages(response.messages);
      await loadConversations();
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={18} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
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
          <ChevronRight size={18} />
        </button>
      </div>
    );
  };

  if (loading && conversations.length === 0) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.loading}>
          <Activity className={styles.spinning} /> Loading conversations...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>
      <header className={styles.header}>
        <div className={styles.huskyContainer}>
          <img src={huskyIcon} alt="Husky" className={styles.huskyImg} />
        </div>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Conversations</h1>
          <p className={styles.subtitle}>Practice and improve your English conversation skills</p>
        </div>
      </header>

      {stats && (
        <section className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <MessageSquare size={24} />
            </div>
            <span className={styles.statNumber}>{stats.totalConversations}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Star size={24} />
            </div>
            <span className={styles.statNumber}>{stats.favoriteConversations}</span>
            <span className={styles.statLabel}>Favorites</span>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <Archive size={24} />
            </div>
            <span className={styles.statNumber}>{stats.archivedConversations}</span>
            <span className={styles.statLabel}>Archived</span>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <List size={24} />
            </div>
            <span className={styles.statNumber}>{stats.totalMessages}</span>
            <span className={styles.statLabel}>Messages</span>
          </div>
        </section>
      )}

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <Layers className={styles.filterIcon} size={18} />
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
          </div>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            />
            Favorites
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showArchivedOnly}
              onChange={(e) => setShowArchivedOnly(e.target.checked)}
            />
            Archived
          </label>
        </div>

        <button
          className={styles.primaryButton}
          onClick={() => setShowCreateForm(true)}
          disabled={isCreating}
        >
          <Plus size={20} /> New Conversation
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className={styles.resultsInfo}>
        <span><List size={16} /> {filteredConversations.length} conversations found</span>
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
            className={`${styles.sortBtn} ${sortBy === 'messageCount' ? styles.active : ''}`}
            onClick={() => handleSortChange('messageCount')}
          >
            Messages {sortBy === 'messageCount' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      <div className={styles.conversationsList}>
        {currentConversations.map((conversation) => (
          <ConversationCard
            key={conversation._id}
            conversation={conversation}
            onEdit={() => setEditingConversation(conversation)}
            onDelete={() => handleDeleteConversation(conversation._id)}
            onToggleFavorite={(e) => handleToggleFavorite(conversation._id, e)}
            onToggleArchived={(e) => handleToggleArchived(conversation._id, e)}
            onSelect={() => handleSelectConversation(conversation)}
            isSelected={selectedConversation?._id === conversation._id}
          />
        ))}
      </div>

      {renderPagination()}

      {filteredConversations.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <MessageSquare size={48} />
          </div>
          <h3>No conversations found</h3>
          <p>Start a new conversation to practice your English!</p>
          <button
            className={styles.primaryButton}
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={20} /> Create your first conversation
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

      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

interface ConversationCardProps {
  conversation: Conversation;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onToggleArchived: (e: React.MouseEvent) => void;
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
      <header className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <span className={`${styles.topicBadge} ${styles[conversation.topic]}`}>
            {conversation.topic.replace('-', ' ')}
          </span>
          <span className={styles.messageCount}>
            <MessageSquare size={12} /> {conversation.messageCount}
          </span>
        </div>
      </header>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{conversation.title}</h3>
        {conversation.description && (
          <p className={styles.cardDescription}>{conversation.description}</p>
        )}
        <footer className={styles.cardFooter}>
          <span className={styles.cardDate}>
            <Calendar size={12} /> {new Date(conversation.createdAt).toLocaleDateString()}
          </span>
          {conversation.lastMessageDate && (
            <span className={styles.lastMessage}>
              <History size={12} /> {new Date(conversation.lastMessageDate).toLocaleDateString()}
            </span>
          )}
        </footer>
      </div>

      <div className={styles.cardActions}>
        <button
          className={`${styles.favoriteAction} ${conversation.isFavorite ? styles.isFavorite : ''}`}
          onClick={onToggleFavorite}
          title={conversation.isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <Heart size={18} fill={conversation.isFavorite ? "#ff6384" : "none"} color={conversation.isFavorite ? "#ff6384" : "rgba(255, 255, 255, 0.4)"} />
        </button>
        <button
          onClick={onSelect}
          className={styles.actionBtn}
          title="Ver conversación"
        >
          Ver
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className={styles.actionBtn}
          title="Editar conversación"
        >
          Editar
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          title="Eliminar conversación"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

interface ConversationFormModalProps {
  conversation?: Conversation;
  onClose: () => void;
  onSubmit: (data: CreateConversationRequest) => Promise<void>;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof CreateConversationRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2>{conversation ? <Edit2 size={24} /> : <Plus size={24} />} {title}</h2>
          <button className={styles.closeButton} onClick={onClose}><X size={24} /></button>
        </header>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              placeholder="e.g., Weekend Plans"
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

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="What is this conversation about?"
              rows={4}
              disabled={isLoading}
            />
          </div>

          <footer className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={isLoading}>Cancel</button>
            <button type="submit" disabled={isLoading} className={styles.primaryButton}>
              {isLoading ? <Activity className={styles.spinning} size={18} /> : <Save size={18} />}
              {conversation ? 'Update' : 'Create'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

interface ConversationModalProps {
  conversation: Conversation;
  messages: Message[];
  onClose: () => void;
  onSendMessage: () => Promise<void>;
  onUpdateMessage: (id: string, content: string) => Promise<void>;
  onDeleteMessage: (id: string) => Promise<void>;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  selectedRole: 'you' | 'other';
  setSelectedRole: (role: 'you' | 'other') => void;
  isSendingMessage: boolean;
  editingMessage: Message | null;
  setEditingMessage: (msg: Message | null) => void;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMessage && editingMessage.content.trim()) {
      onUpdateMessage(editingMessage._id, editingMessage.content);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.conversationModal}`} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className={styles.statIcon} style={{ width: '40px', height: '40px', marginBottom: 0 }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <h2>{conversation.title}</h2>
              <span className={styles.lastMessage}>{conversation.topic}</span>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}><X size={24} /></button>
        </header>

        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div className={styles.emptyState} style={{ background: 'transparent', border: 'none', padding: '2rem 1rem' }}>
              <MessageSquare size={32} style={{ opacity: 0.2 }} />
              <p style={{ opacity: 0.5 }}>No messages yet. Start practicing!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg._id} className={`${styles.message} ${styles[msg.role]}`}>
                <div className={styles.messageHeader}>
                  <span className={styles.roleLabel}>
                    {msg.role === 'you' ? <User size={10} /> : <Activity size={10} />} {msg.role}
                  </span>
                  <span className={styles.messageTime}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className={styles.messageContent}>
                  {editingMessage?._id === msg._id ? (
                    <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <textarea
                        autoFocus
                        value={editingMessage.content}
                        onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                        className={styles.messageTextarea}
                        style={{ background: 'rgba(255,255,255,0.1)', minHeight: '60px' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setEditingMessage(null)} className={styles.cancelButton} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Cancel</button>
                        <button type="submit" className={styles.primaryButton} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}><Save size={12} /> Save</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {msg.content}
                      <div className={styles.messageActions}>
                        <button onClick={() => setEditingMessage(msg)} className={styles.actionBtn} style={{ width: '28px', height: '28px' }}><Edit2 size={12} /></button>
                        <button onClick={() => onDeleteMessage(msg._id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} style={{ width: '28px', height: '28px' }}><Trash2 size={12} /></button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.messageInputContainer}>
          <div className={styles.chatControls}>
            <div className={styles.roleSelector}>
              <button
                className={`${styles.roleBtn} ${selectedRole === 'you' ? styles.active : ''} ${styles.you}`}
                onClick={() => setSelectedRole('you')}
              >
                You
              </button>
              <button
                className={`${styles.roleBtn} ${selectedRole === 'other' ? styles.active : ''} ${styles.other}`}
                onClick={() => setSelectedRole('other')}
              >
                Translator/Other
              </button>
            </div>
            {newMessage.length > 0 && <span className={styles.messageTime}>{newMessage.length} chars</span>}
          </div>

          <div className={styles.messageInputWrapper}>
            <textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              className={styles.messageTextarea}
              rows={1}
            />
            <button
              className={styles.sendBtn}
              onClick={onSendMessage}
              disabled={isSendingMessage || !newMessage.trim()}
            >
              {isSendingMessage ? <Activity className={styles.spinning} size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversations;