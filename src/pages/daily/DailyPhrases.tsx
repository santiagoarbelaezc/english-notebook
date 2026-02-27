import React, { useState, useEffect, useCallback } from 'react';
import styles from './DailyPhrases.module.css';
import {
  getAllPhrases,
  createPhrase,
  updatePhrase,
  deletePhrase,
  toggleFavorite,
  getRandomPhrase,
  getStats
} from '../../api/dailyPhrases.api';
import type { DailyPhrase, CreateDailyPhraseRequest, UpdateDailyPhraseRequest } from '../../types';
import {
  Plus,
  Search,
  Heart,
  Zap,
  BookOpen,
  Award,
  Flame,
  Check,
  X,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import videoHusky from '../../assets/videos/video-husky12.mp4';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';

// ── Component ────────────────────────────────────────────────────────────────

const DailyPhrases: React.FC = () => {
  const [phrases, setPhrases] = useState<DailyPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState<DailyPhrase | null>(null);
  const [dailyPhrase, setDailyPhrase] = useState<DailyPhrase | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({ type: '', isFavorite: false, search: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ── Data loading ───────────────────────────────────────────────────────

  const loadPhrases = useCallback(async () => {
    try {
      const params = {
        type: filters.type || undefined,
        isFavorite: filters.isFavorite || undefined,
        search: filters.search || undefined
      };
      const response = await getAllPhrases(params);
      setPhrases(response.phrases);
    } catch {
      showToast('Error loading phrases', 'error');
    }
  }, [filters]);

  const loadDailyPhrase = async () => {
    try {
      const response = await getRandomPhrase();
      setDailyPhrase(response.phrase);
    } catch { /* no phrases yet */ }
  };

  const loadStats = async () => {
    try {
      const response = await getStats();
      setStats(response.stats);
    } catch { /* stats unavailable */ }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadPhrases(), loadDailyPhrase(), loadStats()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => { loadPhrases(); }, [filters, loadPhrases]);

  // ── Actions ────────────────────────────────────────────────────────────

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreatePhrase = async (data: CreateDailyPhraseRequest) => {
    try {
      await createPhrase(data);
      setShowModal(false);
      loadPhrases(); loadStats();
      showToast('Phrase created successfully', 'success');
    } catch { showToast('Error creating phrase', 'error'); }
  };

  const handleUpdatePhrase = async (id: string, data: UpdateDailyPhraseRequest) => {
    try {
      await updatePhrase(id, data);
      setShowModal(false); setEditingPhrase(null);
      loadPhrases();
      showToast('Phrase updated successfully', 'success');
    } catch { showToast('Error updating phrase', 'error'); }
  };

  const handleDeletePhrase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this phrase?')) return;
    try {
      await deletePhrase(id);
      loadPhrases(); loadStats();
      showToast('Phrase deleted successfully', 'success');
    } catch { showToast('Error deleting phrase', 'error'); }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavorite(id);
      loadPhrases(); loadStats();
    } catch { showToast('Error updating favorite', 'error'); }
  };

  if (loading) return <LoadingOverlay message="Loading phrases..." />;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className={`${styles.pageContent} page-entrance`}>
      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Daily Phrases</h1>
          <p className={styles.subtitle}>Explore and master common English expressions and idioms</p>
        </div>
        <div className={styles.huskyContainer}>
          <video src={videoHusky} autoPlay loop muted playsInline className={styles.huskyVideo} />
        </div>
      </header>

      {/* ── STATS ── */}
      {stats && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--gradient-primary)' }}>
              <BookOpen size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{stats.totalPhrases}</span>
              <span className={styles.statLabel}>Total Phrases</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--gradient-secondary)' }}>
              <Heart size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{stats.favoritePhrases}</span>
              <span className={styles.statLabel}>Favorites</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--gradient-success)' }}>
              <Award size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{stats.byType?.length || 0}</span>
              <span className={styles.statLabel}>Categories</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
              <Flame size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{phrases.length}</span>
              <span className={styles.statLabel}>Showing</span>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTROLS ── */}
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search phrases..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className={styles.filterSelect}
          >
            <option value="">All Types</option>
            <option value="idiom">Idioms</option>
            <option value="expression">Expressions</option>
            <option value="slang">Slang</option>
            <option value="proverb">Proverbs</option>
            <option value="quote">Quotes</option>
            <option value="phrase">Phrases</option>
            <option value="saying">Sayings</option>
          </select>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={filters.isFavorite}
              onChange={(e) => setFilters({ ...filters, isFavorite: e.target.checked })}
            />
            Favorites only
          </label>
        </div>
        <button onClick={() => { setEditingPhrase(null); setShowModal(true); }} className={styles.createButton}>
          + Add Phrase
        </button>
      </div>

      {/* ── DAILY PHRASE ── */}
      {dailyPhrase && !filters.search && !filters.type && !filters.isFavorite && (
        <div className={styles.dailyCard}>
          <div className={styles.dailyHeader}>
            <div className={styles.dailyBadge}>
              <Zap size={14} /> Phrase of the Day
            </div>
          </div>
          <div className={styles.dailyBody}>
            <p className={styles.dailyPhrase}>"{dailyPhrase.phrase}"</p>
            <p className={styles.dailyTranslation}>{dailyPhrase.translation}</p>
            <div className={styles.dailyMeta}>
              <span className={`${styles.typeBadge} ${styles[dailyPhrase.type] || ''}`}>
                {dailyPhrase.type}
              </span>
              {dailyPhrase.keywords.length > 0 && (
                <div className={styles.keywordsRow}>
                  {dailyPhrase.keywords.map((kw, i) => (
                    <span key={i} className={styles.keyword}>#{kw}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS INFO ── */}
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          Showing {phrases.length} phrase{phrases.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── PHRASES GRID ── */}
      <div className={styles.phrasesGrid}>
        {phrases.length > 0 ? (
          phrases.map((phrase) => (
            <div key={phrase._id} className={styles.phraseCard}>
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <span className={`${styles.typeBadge} ${styles[phrase.type] || ''}`}>
                  {phrase.type}
                </span>
              </div>

              {/* Card Content */}
              <div className={styles.cardContent}>
                <h3 className={styles.phraseText}>{phrase.phrase}</h3>
                <p className={styles.phraseTranslation}>{phrase.translation}</p>

                {phrase.keywords.length > 0 && (
                  <div className={styles.keywordsRow}>
                    {phrase.keywords.map((kw, i) => (
                      <span key={i} className={styles.keyword}>#{kw}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className={styles.cardActions}>
                <button
                  className={`${styles.favoriteAction} ${phrase.isFavorite ? styles.isFavorite : ''}`}
                  onClick={() => handleToggleFavorite(phrase._id)}
                  title={phrase.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={18} fill={phrase.isFavorite ? "#ff6384" : "none"} color={phrase.isFavorite ? "#ff6384" : "rgba(255, 255, 255, 0.4)"} />
                </button>
                <div className={styles.mainActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => { setEditingPhrase(phrase); setShowModal(true); }}
                  >
                    Editar
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDeletePhrase(phrase._id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No phrases found</p>
            <button onClick={() => { setEditingPhrase(null); setShowModal(true); }} className={styles.primaryButton}>
              Add your first phrase
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowModal(false); setEditingPhrase(null); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingPhrase ? 'Edit Phrase' : 'Add New Phrase'}</h2>
              <button onClick={() => { setShowModal(false); setEditingPhrase(null); }} className={styles.closeButton}>×</button>
            </div>
            <form
              className={styles.verbForm}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const data = {
                  phrase: fd.get('phrase') as string,
                  translation: fd.get('translation') as string,
                  type: fd.get('type') as any,
                  keywords: (fd.get('keywords') as string).split(',').map(k => k.trim()).filter(k => k),
                };
                editingPhrase
                  ? handleUpdatePhrase(editingPhrase._id, data)
                  : handleCreatePhrase(data);
              }}
            >
              <div className={styles.formSection}>
                <div className={styles.sectionTitleLabel}>Phrase Details</div>
                <div className={styles.formGroupRow}>
                  <div className={styles.formGroup}>
                    <label>Phrase (English)</label>
                    <textarea
                      name="phrase"
                      defaultValue={editingPhrase?.phrase}
                      placeholder="e.g. Break a leg"
                      required
                      rows={3}
                      className={styles.verbFormInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Translation (Spanish)</label>
                    <textarea
                      name="translation"
                      defaultValue={editingPhrase?.translation}
                      placeholder="e.g. Buena suerte"
                      required
                      rows={3}
                      className={styles.verbFormInput}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formGroupRow}>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select name="type" defaultValue={editingPhrase?.type || 'phrase'} className={styles.verbFormInput}>
                    <option value="phrase">Phrase</option>
                    <option value="idiom">Idiom</option>
                    <option value="expression">Expression</option>
                    <option value="slang">Slang</option>
                    <option value="proverb">Proverb</option>
                    <option value="quote">Quote</option>
                    <option value="saying">Saying</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Keywords (comma separated)</label>
                  <input
                    name="keywords"
                    type="text"
                    defaultValue={editingPhrase?.keywords.join(', ')}
                    placeholder="e.g. luck, theater, informal"
                    className={styles.verbFormInput}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => { setShowModal(false); setEditingPhrase(null); }}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingPhrase ? 'Update Phrase' : 'Create Phrase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default DailyPhrases;