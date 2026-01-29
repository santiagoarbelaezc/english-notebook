import React, { useState, useEffect, useCallback } from 'react';
import styles from './Vocabulary.module.css';
import {
  getAllVocabulary,
  createVocabularyWord,
  updateVocabularyWord,
  deleteVocabularyWord,
  toggleVocabularyFavorite,
  getVocabularyStats,
  type VocabularyWord,
  type CreateVocabularyRequest,
  type UpdateVocabularyRequest,
  type VocabularyStats
} from '../../api/vocabulary.api';
import type { VocabularyFilters } from '../../types';

const VocabularyPage: React.FC = () => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [stats, setStats] = useState<VocabularyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);
  const [filters, setFilters] = useState<VocabularyFilters>({
    difficulty: undefined,
    category: undefined,
    isFavorite: undefined,
    search: ''
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state for add/edit modal
  const [formData, setFormData] = useState<CreateVocabularyRequest>({
    word: '',
    pronunciation: '',
    meanings: [{ meaning: '', partOfSpeech: 'noun' }],
    examples: [{ english: '', spanish: '' }],
    synonyms: [],
    antonyms: [],
    difficulty: 'A1',
    category: 'other',
    isFavorite: false
  });

  const loadWords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllVocabulary(filters);
      if (response.success && response.vocabulary) {
        setWords(response.vocabulary);
      }
    } catch (error) {
      console.error('Error loading words:', error);
      showToast('Error loading vocabulary', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const response = await getVocabularyStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    loadWords();
    loadStats();
  }, [loadWords, loadStats]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      word: '',
      pronunciation: '',
      meanings: [{ meaning: '', partOfSpeech: 'noun' }],
      examples: [{ english: '', spanish: '' }],
      synonyms: [],
      antonyms: [],
      difficulty: 'A1',
      category: 'other',
      isFavorite: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWord) {
        const updateData: UpdateVocabularyRequest = { ...formData };
        const response = await updateVocabularyWord(editingWord._id, updateData);
        if (response.success) {
          showToast('Word updated successfully', 'success');
          loadWords();
          setShowEditModal(false);
          setEditingWord(null);
        }
      } else {
        const response = await createVocabularyWord(formData);
        if (response.success) {
          showToast('Word added successfully', 'success');
          loadWords();
          loadStats();
          setShowAddModal(false);
        }
      }
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving word:', error);
      showToast((error as any)?.response?.data?.message || 'Error saving word', 'error');
    }
  };

  const handleEdit = (word: VocabularyWord) => {
    setEditingWord(word);
    setFormData({
      word: word.word,
      pronunciation: word.pronunciation,
      meanings: word.meanings.length > 0 ? word.meanings.map(m => ({ ...m, partOfSpeech: m.partOfSpeech as 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'interjection' | 'other' })) : [{ meaning: '', partOfSpeech: 'noun' as const }],
      examples: word.examples.length > 0 ? word.examples : [{ english: '', spanish: '' }],
      synonyms: word.synonyms,
      antonyms: word.antonyms,
      difficulty: word.difficulty,
      category: word.category,
      isFavorite: word.isFavorite
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this word?')) return;

    try {
      const response = await deleteVocabularyWord(id);
      if (response.success) {
        showToast('Word deleted successfully', 'success');
        loadWords();
        loadStats();
      }
    } catch (error: unknown) {
      console.error('Error deleting word:', error);
      showToast((error as any)?.response?.data?.message || 'Error deleting word', 'error');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const response = await toggleVocabularyFavorite(id);
      if (response.success) {
        loadWords();
        loadStats();
      }
    } catch (error: unknown) {
      console.error('Error toggling favorite:', error);
      showToast((error as any)?.response?.data?.message || 'Error updating favorite', 'error');
    }
  };

  const addMeaning = () => {
    setFormData(prev => ({
      ...prev,
      meanings: [...prev.meanings, { meaning: '', partOfSpeech: 'noun' }]
    }));
  };

  const removeMeaning = (index: number) => {
    setFormData(prev => ({
      ...prev,
      meanings: prev.meanings.filter((_, i) => i !== index)
    }));
  };

  const updateMeaning = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      meanings: prev.meanings.map((meaning, i) =>
        i === index ? { ...meaning, [field]: value } : meaning
      )
    }));
  };

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...(prev.examples || []), { english: '', spanish: '' }]
    }));
  };

  const removeExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: (prev.examples || []).filter((_, i) => i !== index)
    }));
  };

  const updateExample = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      examples: (prev.examples || []).map((example, i) =>
        i === index ? { ...example, [field]: value } : example
      )
    }));
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      'A1': 'Beginner (A1)',
      'A2': 'Elementary (A2)',
      'B1': 'Intermediate (B1)',
      'B2': 'Upper Intermediate (B2)',
      'C1': 'Advanced (C1)',
      'C2': 'Proficient (C2)'
    };
    return labels[difficulty as keyof typeof labels] || difficulty;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'daily-life': 'Daily Life',
      'business': 'Business',
      'travel': 'Travel',
      'food': 'Food',
      'nature': 'Nature',
      'technology': 'Technology',
      'emotions': 'Emotions',
      'sports': 'Sports',
      'other': 'Other'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getPartOfSpeechLabel = (pos: string) => {
    const labels = {
      'noun': 'Noun',
      'verb': 'Verb',
      'adjective': 'Adjective',
      'adverb': 'Adverb',
      'preposition': 'Preposition',
      'conjunction': 'Conjunction',
      'interjection': 'Interjection',
      'other': 'Other'
    };
    return labels[pos as keyof typeof labels] || pos;
  };

  if (loading) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.loading}>Loading vocabulary...</div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.header}>
        <h1 className={styles.title}>📝 Vocabulary</h1>
        <p className={styles.subtitle}>
          Build your English vocabulary with detailed word definitions and translations
        </p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{stats?.totalWords || 0}</span>
          <span className={styles.statLabel}>Total Words</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{stats?.favoriteWords || 0}</span>
          <span className={styles.statLabel}>Favorites</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {stats?.byDifficulty.find(d => d._id === 'A1')?.count || 0}
          </span>
          <span className={styles.statLabel}>Beginner Words</span>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search words, meanings, or examples..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          <select
            value={filters.category || 'all'}
            onChange={(e) => setFilters({ ...filters, category: e.target.value === 'all' ? undefined : e.target.value as 'daily-life' | 'business' | 'travel' | 'food' | 'nature' | 'technology' | 'emotions' | 'sports' | 'other' })}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            <option value="daily-life">Daily Life</option>
            <option value="business">Business</option>
            <option value="travel">Travel</option>
            <option value="food">Food</option>
            <option value="nature">Nature</option>
            <option value="technology">Technology</option>
            <option value="emotions">Emotions</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
          <select
            value={filters.difficulty || 'all'}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value === 'all' ? undefined : e.target.value as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' })}
            className={styles.filterSelect}
          >
            <option value="all">All Levels</option>
            <option value="A1">Beginner (A1)</option>
            <option value="A2">Elementary (A2)</option>
            <option value="B1">Intermediate (B1)</option>
            <option value="B2">Upper Intermediate (B2)</option>
            <option value="C1">Advanced (C1)</option>
            <option value="C2">Proficient (C2)</option>
          </select>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={filters.isFavorite || false}
              onChange={(e) => setFilters({ ...filters, isFavorite: e.target.checked || undefined })}
              className={styles.checkbox}
            />
            Favorites only
          </label>
          <button
            className={styles.primaryButton}
            onClick={() => setShowAddModal(true)}
          >
            Add Word
          </button>
        </div>
      </div>

      <div className={styles.wordsGrid}>
        {words.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No words found</h3>
            <p>Start building your vocabulary by adding your first word!</p>
            <button
              className={styles.primaryButton}
              onClick={() => setShowAddModal(true)}
            >
              Add Your First Word
            </button>
          </div>
        ) : (
          words.map((word) => (
            <div key={word._id} className={styles.wordCard}>
              <div className={styles.cardHeader}>
                <div className={styles.wordMeta}>
                  <span className={`${styles.category} ${styles[word.category] || styles.other}`}>
                    {getCategoryLabel(word.category)}
                  </span>
                  <span className={`${styles.difficulty} ${styles[word.difficulty] || styles.A1}`}>
                    {getDifficultyLabel(word.difficulty)}
                  </span>
                </div>
                <button
                  className={`${styles.favoriteButton} ${word.isFavorite ? styles.favorited : ''}`}
                  onClick={() => handleToggleFavorite(word._id)}
                  title={word.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {word.isFavorite ? '❤️' : '🤍'}
                </button>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.wordText}>
                  {word.word}
                  {word.pronunciation && (
                    <span className={styles.pronunciation}>/{word.pronunciation}/</span>
                  )}
                </div>

                <div className={styles.meanings}>
                  {word.meanings.map((meaning, index) => (
                    <div key={index} className={styles.meaning}>
                      <span className={styles.partOfSpeech}>
                        {getPartOfSpeechLabel(meaning.partOfSpeech)}
                      </span>
                      <span className={styles.meaningText}>{meaning.meaning}</span>
                    </div>
                  ))}
                </div>

                {word.examples && word.examples.length > 0 && (
                  <div className={styles.examples}>
                    <h4>Examples:</h4>
                    {word.examples.map((example, index) => (
                      <div key={index} className={styles.example}>
                        <div className={styles.english}>{example.english}</div>
                        {example.spanish && (
                          <div className={styles.spanish}>{example.spanish}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(word.synonyms?.length > 0 || word.antonyms?.length > 0) && (
                  <div className={styles.wordRelations}>
                    {word.synonyms?.length > 0 && (
                      <div className={styles.synonyms}>
                        <strong>Synonyms:</strong> {word.synonyms.join(', ')}
                      </div>
                    )}
                    {word.antonyms?.length > 0 && (
                      <div className={styles.antonyms}>
                        <strong>Antonyms:</strong> {word.antonyms.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEdit(word)}
                  title="Edit word"
                >
                  ✏️ Edit
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(word._id)}
                  title="Delete word"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Word Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add New Word</h2>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form className={styles.modalForm} onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Word *</label>
                  <input
                    type="text"
                    value={formData.word}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Pronunciation</label>
                  <input
                    type="text"
                    value={formData.pronunciation}
                    onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                    placeholder="e.g., həˈloʊ"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Meanings *</label>
                {formData.meanings.map((meaning, index) => (
                  <div key={index} className={styles.meaningRow}>
                    <select
                      value={meaning.partOfSpeech}
                      onChange={(e) => updateMeaning(index, 'partOfSpeech', e.target.value)}
                    >
                      <option value="noun">Noun</option>
                      <option value="verb">Verb</option>
                      <option value="adjective">Adjective</option>
                      <option value="adverb">Adverb</option>
                      <option value="preposition">Preposition</option>
                      <option value="conjunction">Conjunction</option>
                      <option value="interjection">Interjection</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="text"
                      value={meaning.meaning}
                      onChange={(e) => updateMeaning(index, 'meaning', e.target.value)}
                      placeholder="Meaning in Spanish"
                      required
                    />
                    {formData.meanings.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeMeaning(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={addMeaning}
                >
                  + Add Meaning
                </button>
              </div>

              <div className={styles.formGroup}>
                <label>Examples</label>
                {(formData.examples || []).map((example, index) => (
                  <div key={index} className={styles.exampleRow}>
                    <input
                      type="text"
                      value={example.english}
                      onChange={(e) => updateExample(index, 'english', e.target.value)}
                      placeholder="English example"
                    />
                    <input
                      type="text"
                      value={example.spanish}
                      onChange={(e) => updateExample(index, 'spanish', e.target.value)}
                      placeholder="Spanish translation"
                    />
                    {(formData.examples || []).length > 1 && (
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeExample(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={addExample}
                >
                  + Add Example
                </button>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' })}
                  >
                    <option value="A1">Beginner (A1)</option>
                    <option value="A2">Elementary (A2)</option>
                    <option value="B1">Intermediate (B1)</option>
                    <option value="B2">Upper Intermediate (B2)</option>
                    <option value="C1">Advanced (C1)</option>
                    <option value="C2">Proficient (C2)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'daily-life' | 'business' | 'travel' | 'food' | 'nature' | 'technology' | 'emotions' | 'sports' | 'other' })}
                  >
                    <option value="daily-life">Daily Life</option>
                    <option value="business">Business</option>
                    <option value="travel">Travel</option>
                    <option value="food">Food</option>
                    <option value="nature">Nature</option>
                    <option value="technology">Technology</option>
                    <option value="emotions">Emotions</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isFavorite}
                    onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                  />
                  Add to favorites
                </label>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Add Word
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Word Modal */}
      {showEditModal && editingWord && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Word</h2>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowEditModal(false);
                  setEditingWord(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form className={styles.modalForm} onSubmit={handleSubmit}>
              {/* Same form fields as add modal */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Word *</label>
                  <input
                    type="text"
                    value={formData.word}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Pronunciation</label>
                  <input
                    type="text"
                    value={formData.pronunciation}
                    onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                    placeholder="e.g., həˈloʊ"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Meanings *</label>
                {formData.meanings.map((meaning, index) => (
                  <div key={index} className={styles.meaningRow}>
                    <select
                      value={meaning.partOfSpeech}
                      onChange={(e) => updateMeaning(index, 'partOfSpeech', e.target.value)}
                    >
                      <option value="noun">Noun</option>
                      <option value="verb">Verb</option>
                      <option value="adjective">Adjective</option>
                      <option value="adverb">Adverb</option>
                      <option value="preposition">Preposition</option>
                      <option value="conjunction">Conjunction</option>
                      <option value="interjection">Interjection</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="text"
                      value={meaning.meaning}
                      onChange={(e) => updateMeaning(index, 'meaning', e.target.value)}
                      placeholder="Meaning in Spanish"
                      required
                    />
                    {formData.meanings.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeMeaning(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={addMeaning}
                >
                  + Add Meaning
                </button>
              </div>

              <div className={styles.formGroup}>
                <label>Examples</label>
                {(formData.examples || []).map((example, index) => (
                  <div key={index} className={styles.exampleRow}>
                    <input
                      type="text"
                      value={example.english}
                      onChange={(e) => updateExample(index, 'english', e.target.value)}
                      placeholder="English example"
                    />
                    <input
                      type="text"
                      value={example.spanish}
                      onChange={(e) => updateExample(index, 'spanish', e.target.value)}
                      placeholder="Spanish translation"
                    />
                    {(formData.examples || []).length > 1 && (
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeExample(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={addExample}
                >
                  + Add Example
                </button>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' })}
                  >
                    <option value="A1">Beginner (A1)</option>
                    <option value="A2">Elementary (A2)</option>
                    <option value="B1">Intermediate (B1)</option>
                    <option value="B2">Upper Intermediate (B2)</option>
                    <option value="C1">Advanced (C1)</option>
                    <option value="C2">Proficient (C2)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'daily-life' | 'business' | 'travel' | 'food' | 'nature' | 'technology' | 'emotions' | 'sports' | 'other' })}
                  >
                    <option value="daily-life">Daily Life</option>
                    <option value="business">Business</option>
                    <option value="travel">Travel</option>
                    <option value="food">Food</option>
                    <option value="nature">Nature</option>
                    <option value="technology">Technology</option>
                    <option value="emotions">Emotions</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isFavorite}
                    onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                  />
                  Add to favorites
                </label>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingWord(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Update Word
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default VocabularyPage;