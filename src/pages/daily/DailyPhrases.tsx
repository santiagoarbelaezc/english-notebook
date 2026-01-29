import React, { useState, useEffect } from 'react';
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

const DailyPhrases: React.FC = () => {
  const [phrases, setPhrases] = useState<DailyPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState<DailyPhrase | null>(null);
  const [dailyPhrase, setDailyPhrase] = useState<DailyPhrase | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({
    type: '',
    isFavorite: false,
    search: ''
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadPhrases();
    loadDailyPhrase();
    loadStats();
  }, []);

  useEffect(() => {
    loadPhrases();
  }, [filters]);

  const loadPhrases = async () => {
    try {
      const params = {
        type: filters.type || undefined,
        isFavorite: filters.isFavorite || undefined,
        search: filters.search || undefined
      };
      const response = await getAllPhrases(params);
      setPhrases(response.phrases);
    } catch (error) {
      showToast('Error loading phrases', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDailyPhrase = async () => {
    try {
      const response = await getRandomPhrase();
      setDailyPhrase(response.phrase);
    } catch (error) {
      // No phrases available
    }
  };

  const loadStats = async () => {
    try {
      const response = await getStats();
      setStats(response.stats);
    } catch (error) {
      // Stats not available
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreatePhrase = async (data: CreateDailyPhraseRequest | UpdateDailyPhraseRequest) => {
    try {
      await createPhrase(data as CreateDailyPhraseRequest);
      setShowAddModal(false);
      loadPhrases();
      loadStats();
      showToast('Phrase created successfully', 'success');
    } catch (error) {
      showToast('Error creating phrase', 'error');
    }
  };

  const handleUpdatePhrase = async (id: string, data: CreateDailyPhraseRequest | UpdateDailyPhraseRequest) => {
    try {
      await updatePhrase(id, data as UpdateDailyPhraseRequest);
      setShowEditModal(false);
      setEditingPhrase(null);
      loadPhrases();
      showToast('Phrase updated successfully', 'success');
    } catch (error) {
      showToast('Error updating phrase', 'error');
    }
  };

  const handleDeletePhrase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this phrase?')) return;
    try {
      await deletePhrase(id);
      loadPhrases();
      loadStats();
      showToast('Phrase deleted successfully', 'success');
    } catch (error) {
      showToast('Error deleting phrase', 'error');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavorite(id);
      loadPhrases();
      showToast('Favorite status updated', 'success');
    } catch (error) {
      showToast('Error updating favorite', 'error');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.header}>
        <h1 className={styles.title}>⭐ Daily Phrases</h1>
        <p className={styles.subtitle}>Manage your daily phrases and expressions</p>
      </div>

      {/* Daily Phrase Section */}
      {dailyPhrase && (
        <div className={styles.dailySection}>
          <h2>Today's Phrase</h2>
          <div className={styles.phraseCard}>
            <p className={styles.phrase}>{dailyPhrase.phrase}</p>
            <p className={styles.translation}>{dailyPhrase.translation}</p>
            <span className={styles.type}>{dailyPhrase.type}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{stats.totalPhrases}</span>
            <span className={styles.statLabel}>Total Phrases</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{stats.favoritePhrases}</span>
            <span className={styles.statLabel}>Favorites</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search phrases..."
          value={filters.search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, search: e.target.value })}
          className={styles.input}
        />
        <select
          value={filters.type}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, type: e.target.value })}
          className={styles.select}
        >
          <option value="">All Types</option>
          <option value="idiom">Idiom</option>
          <option value="expression">Expression</option>
          <option value="slang">Slang</option>
          <option value="proverb">Proverb</option>
          <option value="quote">Quote</option>
          <option value="phrase">Phrase</option>
          <option value="saying">Saying</option>
        </select>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={filters.isFavorite}
            onChange={(e) => setFilters({ ...filters, isFavorite: e.target.checked })}
          />
          Favorites only
        </label>
        <button onClick={() => setShowAddModal(true)} className={styles.button}>Add Phrase</button>
      </div>

      {/* Phrases List */}
      <div className={styles.phrasesList}>
        {phrases.map((phrase) => (
          <div key={phrase._id} className={styles.phraseItem}>
            <div className={styles.phraseContent}>
              <p className={styles.phrase}>{phrase.phrase}</p>
              <p className={styles.translation}>{phrase.translation}</p>
              <span className={styles.type}>{phrase.type}</span>
              {phrase.keywords.length > 0 && (
                <div className={styles.keywords}>
                  {phrase.keywords.map((keyword, index) => (
                    <span key={index} className={styles.keyword}>{keyword}</span>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.actions}>
              <button
                className={styles.favoriteBtn}
                onClick={() => handleToggleFavorite(phrase._id)}
              >
                {phrase.isFavorite ? '❤️' : '🤍'}
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => {
                  setEditingPhrase(phrase);
                  setShowEditModal(true);
                }}
              >
                Edit
              </button>
              <button
                className={styles.dangerButton}
                onClick={() => handleDeletePhrase(phrase._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <PhraseForm
          onSubmit={handleCreatePhrase}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingPhrase && (
        <PhraseForm
          initialData={editingPhrase}
          onSubmit={(data) => handleUpdatePhrase(editingPhrase._id, data)}
          onCancel={() => {
            setShowEditModal(false);
            setEditingPhrase(null);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

interface PhraseFormProps {
  initialData?: DailyPhrase;
  onSubmit: (data: CreateDailyPhraseRequest | UpdateDailyPhraseRequest) => void;
  onCancel: () => void;
}

const PhraseForm: React.FC<PhraseFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    phrase: initialData?.phrase || '',
    translation: initialData?.translation || '',
    type: initialData?.type || 'phrase',
    keywords: initialData?.keywords.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
    };
    onSubmit(data);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h3>{initialData ? 'Edit Phrase' : 'Add New Phrase'}</h3>
          <div className={styles.formGroup}>
            <label>Phrase</label>
            <textarea
              value={formData.phrase}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, phrase: e.target.value })}
              required
              className={styles.textarea}
              rows={4}
              placeholder="Enter the English phrase..."
            />
          </div>
          <div className={styles.formGroup}>
            <label>Translation</label>
            <textarea
              value={formData.translation}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, translation: e.target.value })}
              required
              className={styles.textarea}
              rows={4}
              placeholder="Enter the translation..."
            />
          </div>
          <div className={styles.formGroup}>
            <label>Type</label>
            <select
              value={formData.type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, type: e.target.value as any })}
              className={styles.select}
            >
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
              type="text"
              value={formData.keywords}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, keywords: e.target.value })}
              className={styles.input}
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.button}> {initialData ? 'Update' : 'Create'}</button>
            <button type="button" onClick={onCancel} className={styles.secondaryButton}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyPhrases;