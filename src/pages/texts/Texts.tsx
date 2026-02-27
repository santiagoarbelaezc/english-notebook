import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  X,
  Star,
  Heart,
  Edit2,
  Trash2,
  BookOpen,
  Book,
  Tag,
  Check,
  AlertCircle,
  Save,
  FileText,
} from 'lucide-react';
import huskyVideo from '../../assets/videos/video-husky8.mp4';
import styles from './Texts.module.css';
import {
  getAllTexts,
  createText,
  updateText,
  deleteText,
  toggleTextFavorite,
} from '../../api/texts.api';
import type {
  Text,
  CreateTextRequest,
  UpdateTextRequest,
  TextType,
  TextCategory,
} from '../../types';

// ── Helpers ─────────────────────────────────────────────────────────────────

const calcWordCount = (content: string) => content.trim().split(/\s+/).length;

const calcReadTime = (content: string): string => {
  const mins = Math.ceil(calcWordCount(content) / 200);
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const TYPE_LABELS: Record<TextType, string> = {
  article: 'Article', story: 'Story', news: 'News', blog: 'Blog',
  'book-excerpt': 'Book', email: 'Email', letter: 'Letter', poem: 'Poem', other: 'Other',
};

const TYPE_STYLE: Record<TextType, string> = {
  article: 'typeArticle', story: 'typeStory', news: 'typeNews', blog: 'typeBlog',
  'book-excerpt': 'typeBook', email: 'typeEmail', letter: 'typeLetter', poem: 'typePoem', other: 'typeOther',
};

const formatCategory = (cat: string) =>
  cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

// ── Main Component ───────────────────────────────────────────────────────────

const Texts: React.FC = () => {
  const [texts, setTexts] = useState<Text[]>([]);
  const [filteredTexts, setFilteredTexts] = useState<Text[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingText, setEditingText] = useState<Text | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Data loading ────────────────────────────────────────────────────────

  const loadTexts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllTexts();
      setTexts(res.texts);
    } catch (err: any) {
      setError(err.message || 'Failed to load texts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTexts(); }, [loadTexts]);

  // ── Filtering ────────────────────────────────────────────────────────────

  useEffect(() => {
    let filtered = [...texts];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.source || '').toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q)
      );
    }
    if (selectedType !== 'all') filtered = filtered.filter(t => t.type === selectedType);
    if (selectedCategory !== 'all') filtered = filtered.filter(t => t.category === selectedCategory);
    if (showFavoritesOnly) filtered = filtered.filter(t => t.isFavorite);

    setFilteredTexts(filtered);
  }, [texts, searchTerm, selectedType, selectedCategory, showFavoritesOnly]);

  // ── CRUD handlers ────────────────────────────────────────────────────────

  const handleCreate = async (data: CreateTextRequest) => {
    try {
      setIsSubmitting(true);
      await createText(data);
      showToast('Text created successfully!');
      setShowCreateForm(false);
      await loadTexts();
    } catch (err: any) {
      showToast(err.message || 'Failed to create text', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, data: UpdateTextRequest) => {
    try {
      setIsSubmitting(true);
      await updateText(id, data);
      showToast('Text updated!');
      setEditingText(null);
      await loadTexts();
    } catch (err: any) {
      showToast(err.message || 'Failed to update text', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this text?')) return;
    try {
      await deleteText(id);
      showToast('Text deleted');
      await loadTexts();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete text', 'error');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await toggleTextFavorite(id);
      setTexts(prev => prev.map(t => t._id === id ? res.text : t));
    } catch (err: any) {
      showToast('Failed to update favorite', 'error');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading && texts.length === 0) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.loading}>
          <BookOpen size={40} className={styles.loadingIcon} />
          <p>Loading texts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Readings &amp; Texts</h1>
          <p className={styles.subtitle}>Improve your reading comprehension with curated texts for different levels</p>
          <p className={styles.description}>
            Explore articles, stories, poems and more. Annotate vocabulary,
            save key expressions, and track your reading progress all in one place.
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
          <div className={styles.statIcon} style={{ background: 'var(--gradient-primary)' }}>
            <Book size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Texts</p>
            <span className={styles.statValue}>{texts.length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--gradient-secondary)' }}>
            <Star size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Favorites</p>
            <span className={styles.statValue}>{texts.filter(t => t.isFavorite).length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--gradient-success)' }}>
            <Tag size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>With Vocabulary</p>
            <span className={styles.statValue}>{texts.filter(t => t.annotatedVocabulary.length > 0).length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' }}>
            <FileText size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Showing</p>
            <span className={styles.statValue}>{filteredTexts.length}</span>
          </div>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search texts, sources, content..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className={styles.filterSelect}>
            <option value="all">All Types</option>
            {(Object.keys(TYPE_LABELS) as TextType[]).map(k => (
              <option key={k} value={k}>{TYPE_LABELS[k]}</option>
            ))}
          </select>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className={styles.filterSelect}>
            <option value="all">All Categories</option>
            <option value="daily-life">Daily Life</option>
            <option value="business">Business</option>
            <option value="travel">Travel</option>
            <option value="culture">Culture</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="self-improvement">Self-Improvement</option>
            <option value="other">Other</option>
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
          <Plus size={20} /> Add Text
        </button>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* ── RESULTS INFO ── */}
      {texts.length > 0 && (
        <div className={styles.resultsInfo}>
          <span className={styles.resultsCount}>
            Showing {filteredTexts.length} of {texts.length} texts
          </span>
        </div>
      )}

      {/* ── GRID ── */}
      {filteredTexts.length === 0 && !loading ? (
        <div className={styles.emptyState}>
          <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>{texts.length === 0 ? 'No texts yet. Add your first text to get started!' : 'No texts match your filters.'}</p>
          {texts.length > 0 && (
            <button
              className={styles.clearFiltersBtn}
              onClick={() => { setSearchTerm(''); setSelectedType('all'); setSelectedCategory('all'); setShowFavoritesOnly(false); }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.textsGrid}>
          {filteredTexts.map(text => {
            const wordCount = calcWordCount(text.content);
            const readTime = calcReadTime(text.content);
            const excerpt = text.content.length > 220
              ? text.content.slice(0, 220).trimEnd() + '…'
              : text.content;

            return (
              <div key={text._id} className={styles.textCard}>
                {/* Card Header */}
                <div className={styles.textCardTop}>
                  <div className={styles.textMeta}>
                    <span className={`${styles.typeBadge} ${styles[TYPE_STYLE[text.type] as keyof typeof styles]}`}>
                      {TYPE_LABELS[text.type]}
                    </span>
                    <span className={styles.categoryBadge}>{formatCategory(text.category)}</span>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={`${styles.iconBtn} ${text.isFavorite ? styles.iconBtnFav : ''}`}
                      onClick={() => handleToggleFavorite(text._id)}
                      aria-label="Toggle favorite"
                      title="Favorite"
                    >
                      <Heart size={15} fill={text.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
                      onClick={() => setEditingText(text)}
                      aria-label="Edit"
                      title="Editar"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                      onClick={() => handleDelete(text._id)}
                      aria-label="Delete"
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className={styles.textBody}>
                  <h3 className={styles.textTitle}>{text.title}</h3>
                  {text.source ? <p className={styles.textAuthor}>📎 {text.source}</p> : null}
                  <p className={styles.excerpt}>{excerpt}</p>
                </div>

                {/* Card Footer */}
                <div className={styles.textFooter}>
                  <div className={styles.textStats}>
                    <span className={styles.wordCount}>{wordCount.toLocaleString()} words</span>
                    <span className={styles.readTime}>⏱ {readTime}</span>
                    {text.annotatedVocabulary.length > 0 && (
                      <span className={styles.vocabBadge}>📝 {text.annotatedVocabulary.length} words</span>
                    )}
                  </div>
                  <button className={styles.readBtn} onClick={() => setEditingText(text)}>
                    Ver texto
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      {showCreateForm && (
        <TextFormModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreate}
          title="Add New Text"
          isLoading={isSubmitting}
        />
      )}

      {/* ── EDIT MODAL ── */}
      {editingText && (
        <TextFormModal
          text={editingText}
          onClose={() => setEditingText(null)}
          onSubmit={(data) => handleUpdate(editingText._id, data)}
          title="Edit Text"
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

// ── Text Form Modal ──────────────────────────────────────────────────────────

interface TextFormModalProps {
  text?: Text;
  onClose: () => void;
  onSubmit: (data: CreateTextRequest) => Promise<void>;
  title: string;
  isLoading?: boolean;
}

const EMPTY_FORM: CreateTextRequest = {
  title: '',
  content: '',
  type: 'article',
  category: 'other',
  source: '',
  summary: '',
  notes: '',
  comprehensionNotes: '',
  annotatedVocabulary: [],
  keyExpressions: [],
};

const TextFormModal: React.FC<TextFormModalProps> = ({ text, onClose, onSubmit, title, isLoading = false }) => {
  const [formData, setFormData] = useState<CreateTextRequest>(EMPTY_FORM);

  useEffect(() => {
    if (text) {
      setFormData({
        title: text.title,
        content: text.content,
        type: text.type,
        category: text.category,
        source: text.source || '',
        summary: text.summary || '',
        notes: text.notes || '',
        comprehensionNotes: text.comprehensionNotes || '',
        annotatedVocabulary: text.annotatedVocabulary,
        keyExpressions: text.keyExpressions,
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [text]);

  const set = (field: keyof CreateTextRequest, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h2>
            {text ? <Edit2 size={22} /> : <Plus size={22} />}
            {title}
          </h2>
          <button className={styles.closeButton} onClick={onClose}><X size={22} /></button>
        </header>

        <form onSubmit={handleSubmit} className={styles.modalForm}>

          {/* Row 1: Title + Type */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => set('title', e.target.value)}
                required
                placeholder="e.g., The Road Not Taken"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Type</label>
              <select value={formData.type} onChange={e => set('type', e.target.value as TextType)}>
                {(Object.entries(TYPE_LABELS) as [TextType, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Category + Source */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Category</label>
              <select value={formData.category} onChange={e => set('category', e.target.value as TextCategory)}>
                <option value="daily-life">Daily Life</option>
                <option value="business">Business</option>
                <option value="travel">Travel</option>
                <option value="culture">Culture</option>
                <option value="science">Science</option>
                <option value="history">History</option>
                <option value="self-improvement">Self-Improvement</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Source / Author</label>
              <input
                type="text"
                value={formData.source}
                onChange={e => set('source', e.target.value)}
                placeholder="e.g., Robert Frost / BBC News"
              />
            </div>
          </div>

          {/* Content */}
          <div className={styles.formGroup}>
            <label>Content *</label>
            <textarea
              value={formData.content}
              onChange={e => set('content', e.target.value)}
              required
              rows={8}
              placeholder="Paste or write the full text here..."
              className={styles.textareaLg}
            />
          </div>

          {/* Summary */}
          <div className={styles.formGroup}>
            <label>Summary <span className={styles.optional}>(optional)</span></label>
            <textarea
              value={formData.summary}
              onChange={e => set('summary', e.target.value)}
              rows={3}
              placeholder="A brief summary of the text..."
              maxLength={500}
            />
          </div>

          {/* Notes */}
          <div className={styles.formGroup}>
            <label>Personal Notes <span className={styles.optional}>(optional)</span></label>
            <textarea
              value={formData.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="Your personal notes..."
              maxLength={2000}
            />
          </div>

          {/* Comprehension Notes */}
          <div className={styles.formGroup}>
            <label>Comprehension Notes <span className={styles.optional}>(optional)</span></label>
            <textarea
              value={formData.comprehensionNotes}
              onChange={e => set('comprehensionNotes', e.target.value)}
              rows={2}
              placeholder="Notes on your understanding..."
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Saving...' : <><Save size={16} /> {text ? 'Update Text' : 'Create Text'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Texts;