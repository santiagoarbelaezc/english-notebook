import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Heart, Plus, X, Edit2, Trash2,
  Check, AlertCircle, Save, Layers, Target,
  CheckCircle2, XCircle, RotateCcw, Star,
  TrendingUp,
} from 'lucide-react';
import huskyVideo from '../../assets/videos/video-husky10.mp4';
import styles from './Flashcards.module.css';
import {
  getAllFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  toggleFlashcardFavorite,
  markFlashcardCorrect,
  markFlashcardIncorrect,
  getFlashcardStats,
} from '../../api/flashcards.api';
import type {
  Flashcard,
  FlashcardDifficulty,
  CreateFlashcardRequest,
  UpdateFlashcardRequest,
} from '../../types';

// ── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_LABELS: Record<FlashcardDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

// ── Main Component ───────────────────────────────────────────────────────────

const Flashcards: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [flippedCard, setFlippedCard] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Data Loading ─────────────────────────────────────────────────────────

  const loadFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, statsRes] = await Promise.all([
        getAllFlashcards(),
        getFlashcardStats(),
      ]);
      setFlashcards(res.flashcards);
      setStats(statsRes.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFlashcards(); }, [loadFlashcards]);

  // ── Filtering ─────────────────────────────────────────────────────────────

  useEffect(() => {
    let filtered = [...flashcards];
    const q = searchTerm.toLowerCase();

    if (q) {
      filtered = filtered.filter(c =>
        c.front.toLowerCase().includes(q) ||
        c.back.toLowerCase().includes(q) ||
        c.deck.toLowerCase().includes(q)
      );
    }
    if (selectedDifficulty !== 'all') filtered = filtered.filter(c => c.difficulty === selectedDifficulty);
    if (showFavoritesOnly) filtered = filtered.filter(c => c.isFavorite);

    setFilteredFlashcards(filtered);
  }, [flashcards, searchTerm, selectedDifficulty, showFavoritesOnly]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleCreate = async (data: CreateFlashcardRequest) => {
    try {
      setIsSubmitting(true);
      await createFlashcard(data);
      showToast('Flashcard created! 🃏');
      setShowCreateForm(false);
      await loadFlashcards();
    } catch (err: any) {
      showToast(err.message || 'Failed to create flashcard', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, data: UpdateFlashcardRequest) => {
    try {
      setIsSubmitting(true);
      await updateFlashcard(id, data);
      showToast('Flashcard updated!');
      setEditingFlashcard(null);
      await loadFlashcards();
    } catch (err: any) {
      showToast(err.message || 'Failed to update', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this flashcard?')) return;
    try {
      await deleteFlashcard(id);
      showToast('Flashcard deleted');
      await loadFlashcards();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await toggleFlashcardFavorite(id);
      setFlashcards(prev =>
        prev.map(c => c._id === id ? { ...c, isFavorite: res.flashcard.isFavorite } : c)
      );
    } catch (err: any) {
      showToast('Failed to toggle favorite', 'error');
    }
  };

  const handleMarkCorrect = async (id: string) => {
    try {
      await markFlashcardCorrect(id);
      showToast('Correct! ✅');
      setFlippedCard(null);
      await loadFlashcards();
    } catch (err: any) {
      showToast('Failed to record answer', 'error');
    }
  };

  const handleMarkIncorrect = async (id: string) => {
    try {
      await markFlashcardIncorrect(id);
      showToast('Keep practicing! 💪');
      setFlippedCard(null);
      await loadFlashcards();
    } catch (err: any) {
      showToast('Failed to record answer', 'error');
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getDifficultyStyle = (d: FlashcardDifficulty) => {
    switch (d) {
      case 'easy': return styles.diffEasy;
      case 'medium': return styles.diffMedium;
      case 'hard': return styles.diffHard;
    }
  };

  const toggleFlip = (id: string) => {
    setFlippedCard(prev => prev === id ? null : id);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading && flashcards.length === 0) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.loading}>
          <Layers size={40} className={styles.loadingIcon} />
          <p>Loading flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Flashcards</h1>
          <p className={styles.subtitle}>Master new vocabulary with interactive flashcards</p>
          <p className={styles.description}>
            Create decks, flip cards to study, and use spaced repetition
            to lock new words into your long-term memory.
          </p>
        </div>
        <div className={styles.huskyContainer}>
          <video
            className={styles.huskyVideo}
            src={huskyVideo}
            autoPlay loop muted playsInline
          />
        </div>
      </header>

      {/* ── STATS ── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Layers size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Cards</p>
            <span className={styles.statValue}>{stats?.totalCards ?? flashcards.length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Heart size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Favorites</p>
            <span className={styles.statValue}>{stats?.favoriteCards ?? flashcards.filter(c => c.isFavorite).length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <Target size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Accuracy</p>
            <span className={styles.statValue}>{stats?.accuracyRate ?? '—'}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #a8edea 0%, #00d4ff 100%)' }}>
            <TrendingUp size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Reviews</p>
            <span className={styles.statValue}>{stats?.totalReviews ?? 0}</span>
          </div>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search flashcards..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)} className={styles.filterSelect}>
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={e => setShowFavoritesOnly(e.target.checked)}
            />
            Favorites only
          </label>
        </div>
        <button className={styles.createButton} onClick={() => setShowCreateForm(true)}>
          <Plus size={20} /> Add Card
        </button>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* ── RESULTS INFO ── */}
      {flashcards.length > 0 && (
        <div className={styles.resultsInfo}>
          <span className={styles.resultsCount}>
            Showing {filteredFlashcards.length} of {flashcards.length} cards
          </span>
        </div>
      )}

      {/* ── GRID ── */}
      {filteredFlashcards.length === 0 && !loading ? (
        <div className={styles.emptyState}>
          <Layers size={48} style={{ opacity: 0.25, marginBottom: '1rem' }} />
          <p>{flashcards.length === 0 ? 'No flashcards yet. Create your first one!' : 'No cards match your filters.'}</p>
          {flashcards.length > 0 && (
            <button className={styles.clearFiltersBtn} onClick={() => { setSearchTerm(''); setSelectedDifficulty('all'); setShowFavoritesOnly(false); }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.flashcardsGrid}>
          {filteredFlashcards.map(card => {
            const isFlipped = flippedCard === card._id;
            return (
              <div key={card._id} className={styles.cardWrapper}>
                <div
                  className={`${styles.flashcard} ${isFlipped ? styles.flipped : ''}`}
                  onClick={() => toggleFlip(card._id)}
                >
                  <div className={styles.flashcardInner}>
                    {/* FRONT */}
                    <div className={styles.flashcardFront}>
                      <div className={styles.cardTopBar}>
                        <span className={`${styles.diffBadge} ${getDifficultyStyle(card.difficulty)}`}>
                          {DIFFICULTY_LABELS[card.difficulty]}
                        </span>
                        <span className={styles.deckBadge}>{card.deck}</span>
                      </div>
                      <div className={styles.cardText}>{card.front}</div>
                      <div className={styles.flipHint}>
                        <RotateCcw size={14} /> Click to flip
                      </div>
                    </div>
                    {/* BACK */}
                    <div className={styles.flashcardBack}>
                      <div className={styles.cardTopBar}>
                        <span className={`${styles.diffBadge} ${getDifficultyStyle(card.difficulty)}`}>
                          {DIFFICULTY_LABELS[card.difficulty]}
                        </span>
                        <span className={styles.deckBadge}>{card.deck}</span>
                      </div>
                      <div className={styles.cardText}>{card.back}</div>
                      {/* SRS buttons */}
                      <div className={styles.srsButtons} onClick={e => e.stopPropagation()}>
                        <button className={styles.srsCorrect} onClick={() => handleMarkCorrect(card._id)}>
                          <CheckCircle2 size={16} /> Got it
                        </button>
                        <button className={styles.srsIncorrect} onClick={() => handleMarkIncorrect(card._id)}>
                          <XCircle size={16} /> Missed
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Actions below card */}
                <div className={styles.cardActions}>
                  <button
                    className={`${styles.iconBtn} ${card.isFavorite ? styles.iconBtnFav : ''}`}
                    onClick={() => handleToggleFavorite(card._id)}
                    title="Favorite"
                  >
                    <Heart size={14} fill={card.isFavorite ? '#ff6384' : 'none'} />
                  </button>
                  <button
                    className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
                    onClick={() => setEditingFlashcard(card)}
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                    onClick={() => handleDelete(card._id)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                  {card.statistics.timesReviewed > 0 && (
                    <span className={styles.reviewStat}>
                      <Star size={12} /> {card.statistics.timesCorrect}/{card.statistics.timesReviewed}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      {showCreateForm && (
        <FlashcardFormModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreate}
          title="Add Flashcard"
          isLoading={isSubmitting}
        />
      )}

      {/* ── EDIT MODAL ── */}
      {editingFlashcard && (
        <FlashcardFormModal
          flashcard={editingFlashcard}
          onClose={() => setEditingFlashcard(null)}
          onSubmit={(data) => handleUpdate(editingFlashcard._id, data)}
          title="Edit Flashcard"
          isLoading={isSubmitting}
        />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

// ── Flashcard Form Modal ─────────────────────────────────────────────────────

interface FlashcardFormModalProps {
  flashcard?: Flashcard;
  onClose: () => void;
  onSubmit: (data: CreateFlashcardRequest) => Promise<void>;
  title: string;
  isLoading?: boolean;
}

const EMPTY_FORM: CreateFlashcardRequest = {
  front: '',
  back: '',
  deck: 'General',
  difficulty: 'medium',
};

const FlashcardFormModal: React.FC<FlashcardFormModalProps> = ({
  flashcard, onClose, onSubmit, title, isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateFlashcardRequest>(EMPTY_FORM);

  useEffect(() => {
    if (flashcard) {
      setFormData({
        front: flashcard.front,
        back: flashcard.back,
        deck: flashcard.deck,
        difficulty: flashcard.difficulty,
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [flashcard]);

  const set = (field: keyof CreateFlashcardRequest, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h2>
            {flashcard ? <Edit2 size={22} /> : <Plus size={22} />}
            {title}
          </h2>
          <button className={styles.closeButton} onClick={onClose}><X size={22} /></button>
        </header>

        <form onSubmit={handleSubmit} className={styles.modalForm}>

          {/* Front */}
          <div className={styles.formGroup}>
            <label>Front (Question) *</label>
            <textarea
              value={formData.front}
              onChange={e => set('front', e.target.value)}
              required
              rows={3}
              placeholder="e.g., Hello"
            />
          </div>

          {/* Back */}
          <div className={styles.formGroup}>
            <label>Back (Answer) *</label>
            <textarea
              value={formData.back}
              onChange={e => set('back', e.target.value)}
              required
              rows={3}
              placeholder="e.g., Hola"
            />
          </div>

          {/* Deck + Difficulty */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Deck</label>
              <input
                type="text"
                value={formData.deck}
                onChange={e => set('deck', e.target.value)}
                placeholder="General"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Difficulty</label>
              <select value={formData.difficulty} onChange={e => set('difficulty', e.target.value as FlashcardDifficulty)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Saving...' : <><Save size={16} /> {flashcard ? 'Update' : 'Create'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Flashcards;
