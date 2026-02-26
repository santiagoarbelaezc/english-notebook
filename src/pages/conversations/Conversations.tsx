import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Layers,
  Activity,
  Star,
  Heart,
  Edit2,
  Trash2,
  Plus,
  X,
  MessageSquare,
  Send,
  Check,
  AlertCircle,
  User,
} from 'lucide-react';
import {
  getAllConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  toggleConversationFavorite,
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
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import styles from './Conversations.module.css';
import videoHusky from '../../assets/videos/video-husky4.mp4';

export const Conversations: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingConversation, setEditingConversation] = useState<Conversation | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState<'you' | 'other'>('you');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAuthError = useCallback((err: any) => {
    if (err.status === 401) {
      tokenService.clearTokens();
      window.location.href = '/login';
    } else {
      setError(err.message || 'An error occurred');
      showToast(err.message || 'An error occurred', 'error');
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllConversations();
      setConversations(response.conversations);
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  const loadStats = useCallback(async () => {
    try {
      const response = await getConversationStats();
      setStats(response.stats);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await getMessages(conversationId);
      setMessages(response.messages);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      handleAuthError(err);
    }
  }, [handleAuthError]);

  useEffect(() => {
    const fetchData = async () => {
      await loadConversations();
      await loadStats();
    };
    fetchData();
  }, [loadConversations, loadStats]);

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, fetchMessages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const filterAndSortConversations = useCallback(() => {
    let filtered = [...conversations];

    if (searchTerm) {
      filtered = filtered.filter(conversation =>
        conversation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Default sort by recent
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredConversations(filtered);
  }, [conversations, searchTerm]);

  useEffect(() => {
    filterAndSortConversations();
  }, [filterAndSortConversations]);

  const handleDeleteConversation = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation(id);
        showToast('Conversation deleted');
        if (selectedConversation?._id === id) {
          setSelectedConversation(null);
        }
        await loadConversations();
        await loadStats();
      } catch (err: any) {
        handleAuthError(err);
      }
    }
  };

  const handleToggleFavorite = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await toggleConversationFavorite(id);
      await loadConversations();
      await loadStats();
      if (selectedConversation?._id === id) {
        setSelectedConversation(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
      }
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
      if (selectedConversation?._id === id) {
        setSelectedConversation(prev => prev ? { ...prev, ...conversationData } as Conversation : null);
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setEditingMessage(null);
    setNewMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      await fetchMessages(selectedConversation._id);
      await loadConversations();
      await loadStats();
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
      await fetchMessages(selectedConversation._id);
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConversation || !window.confirm('Delete this message?')) return;

    try {
      await deleteMessage(selectedConversation._id, messageId);
      await fetchMessages(selectedConversation._id);
      await loadConversations();
      await loadStats();
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  if (loading && conversations.length === 0) {
    return <LoadingOverlay message="Loading your conversations..." />;
  }

  return (
    <div className={`${styles.pageContent} page-entrance`}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.greetingBadge}>English Practice</div>
          <h1 className={styles.title}>Conversations</h1>
          <p className={styles.subtitle}>
            Practice your English by chatting about different topics and roles.
          </p>
          {stats && (
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} color="#a8edea" />
                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{stats.totalConversations} Chats</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={16} color="#fbbf24" />
                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{stats.favoriteConversations} Favorites</span>
              </div>
            </div>
          )}
        </div>
        <div className={styles.huskyContainer}>
          <video
            src={videoHusky}
            autoPlay
            loop
            muted
            playsInline
            className={styles.huskyVideo}
          />
        </div>
      </header>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.appContainer}>
        {/* Sidebar */}
        <div className={styles.listColumn}>
          <div className={styles.listHeader}>
            <div className={styles.listTitle}>
              <Layers size={20} />
              <span>Your Chats</span>
            </div>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button
              className={styles.primaryButton}
              onClick={() => setShowCreateForm(true)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Plus size={18} />
              <span>New Conversation</span>
            </button>
          </div>

          <div className={styles.scrollArea}>
            {loading ? (
              <div className={styles.loading} style={{ minHeight: '200px' }}>
                <LoadingOverlay fullScreen={false} message="" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className={styles.emptyState} style={{ padding: '2rem 1rem', border: 'none', background: 'transparent' }}>
                <MessageSquare size={32} style={{ opacity: 0.1 }} />
                <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>No chats found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv._id}
                  className={`${styles.listItem} ${selectedConversation?._id === conv._id ? styles.selected : ''}`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className={styles.listItemIcon}>
                    <MessageSquare size={20} />
                  </div>
                  <div className={styles.listItemContent}>
                    <h3 className={styles.listItemTitle}>{conv.title}</h3>
                    <span className={styles.listItemTopic}>{conv.topic}</span>
                  </div>
                  {conv.isFavorite && <Star size={14} fill="#fbbf24" color="#fbbf24" style={{ flexShrink: 0 }} />}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Main Area */}
        <div className={styles.chatColumn}>
          {selectedConversation ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatInfo}>
                  <div className={styles.chatAvatar}>
                    <User size={24} />
                  </div>
                  <div className={styles.chatDetails}>
                    <h2>{selectedConversation.title}</h2>
                    <span>{selectedConversation.topic}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleToggleFavorite(selectedConversation._id)}
                    className={styles.favoriteAction}
                    style={{ background: 'transparent', border: 'none' }}
                  >
                    <Heart
                      size={20}
                      fill={selectedConversation.isFavorite ? "#ff4d6d" : "transparent"}
                      color={selectedConversation.isFavorite ? "#ff4d6d" : "rgba(255,255,255,0.4)"}
                    />
                  </button>
                  <button
                    onClick={() => {
                      setEditingConversation(selectedConversation);
                      setShowCreateForm(true);
                    }}
                    className={styles.actionBtn}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteConversation(selectedConversation._id)}
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.messagesContainer} ref={messagesContainerRef}>
                {messages.length === 0 ? (
                  <div className={styles.noSelectedChat}>
                    <MessageSquare className={styles.noSelectedIcon} />
                    <p>No messages yet. Send your first message to start practicing!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg._id} className={`${styles.message} ${styles[msg.role]}`}>
                      <div className={styles.messageHeader}>
                        <span className={styles.roleLabel}>
                          {msg.role === 'you' ? 'YOU' : 'OTHER'}
                        </span>
                        <span className={styles.messageTime}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={styles.messageContent}>
                        {editingMessage?._id === msg._id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <textarea
                              value={editingMessage.content}
                              onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                              className={styles.messageTextarea}
                              style={{ background: 'rgba(255,255,255,0.1)', minHeight: '80px' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button onClick={() => setEditingMessage(null)} className={styles.cancelButton}>Cancel</button>
                              <button onClick={() => handleUpdateMessage(msg._id, editingMessage.content)} className={styles.primaryButton}>Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {msg.content}
                            <div className={styles.messageActions}>
                              <button onClick={() => setEditingMessage(msg)} className={styles.actionBtn}><Edit2 size={12} /></button>
                              <button onClick={() => handleDeleteMessage(msg._id)} className={`${styles.actionBtn} ${styles.deleteBtn}`}><Trash2 size={12} /></button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
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
                      Other/Translator
                    </button>
                  </div>
                </div>

                <div className={styles.messageInputWrapper}>
                  <textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className={styles.messageTextarea}
                  />
                  <button
                    className={styles.sendBtn}
                    onClick={handleSendMessage}
                    disabled={isSendingMessage || !newMessage.trim()}
                  >
                    {isSendingMessage ? <Activity className={styles.spinning} size={18} /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.noSelectedChat}>
              <MessageSquare className={styles.noSelectedIcon} />
              <h2 className={styles.chatTitle}>Select a Conversation</h2>
              <p>Practice your English speaking skills with integrated chats.</p>
            </div>
          )}
        </div>
      </div>

      {showCreateForm && (
        <ConversationFormModal
          isOpen={showCreateForm}
          onClose={() => {
            setShowCreateForm(false);
            setEditingConversation(null);
          }}
          onSubmit={editingConversation ? (data) => handleUpdateConversation(editingConversation._id, data) : handleCreateConversation}
          conversation={editingConversation}
          title={editingConversation ? 'Edit Conversation' : 'New Conversation'}
          isLoading={isCreating || isUpdating}
        />
      )}

      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

// Modal for Create/Edit
interface ConversationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  conversation?: Conversation | null;
  title: string;
  isLoading: boolean;
}

const ConversationFormModal: React.FC<ConversationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  conversation,
  title,
  isLoading
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
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}><X size={24} /></button>
        </header>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Job Interview Practice"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Topic</label>
            <select
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value as any })}
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
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this conversation about?"
              rows={3}
            />
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton} disabled={isLoading}>
              {isLoading ? <Activity className={styles.spinning} size={18} /> : (conversation ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Conversations;