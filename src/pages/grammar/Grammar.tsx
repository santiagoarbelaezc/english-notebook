import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Layers,
  Activity,
  Plus,
  X,
  FileText,
  Star,
  Heart,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Book,
  Check,
  Save,
  AlertCircle,
  List,
  ArrowRight
} from 'lucide-react';
import {
  getAllGrammarRules,
  createGrammarRule,
  updateGrammarRule,
  deleteGrammarRule,
  toggleGrammarRuleFavorite,
  getGrammarStats
} from '../../api';
import type { GrammarRule, CreateGrammarRuleRequest, UpdateGrammarRuleRequest, HighlightedWord } from '../../types';
import styles from './Grammar.module.css';
import videoHusky from '../../assets/videos/video-husky10.mp4';

export const Grammar: React.FC = () => {
  const [rules, setRules] = useState<GrammarRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<GrammarRule[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRule, setEditingRule] = useState<GrammarRule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState<'title' | 'category' | 'difficulty' | 'favorites'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (showFavoritesOnly) params.isFavorite = true;

      const response = await getAllGrammarRules(params);
      setRules(response.grammar);
      setError(null);
    } catch (err: any) {
      console.error('Error loading grammar rules:', err);
      setError(err.message || 'Failed to load grammar rules');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, difficultyFilter, showFavoritesOnly]);

  const loadStats = useCallback(async () => {
    try {
      const response = await getGrammarStats();
      setStats(response.stats);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  }, []);

  useEffect(() => {
    loadRules();
    loadStats();
  }, [loadRules, loadStats]);

  const filterAndSortRules = useCallback(() => {
    let filtered = [...rules];

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(rule =>
        rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.explanation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(rule => rule.category === categoryFilter);
    }

    if (difficultyFilter) {
      filtered = filtered.filter(rule => rule.difficulty === difficultyFilter);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(rule => rule.isFavorite);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'difficulty':
          const difficultyOrder: any = { 'beginner': 1, 'elementary': 2, 'intermediate': 3, 'upper-intermediate': 4, 'advanced': 5 };
          comparison = (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
          break;
        case 'favorites':
          comparison = (a.isFavorite === b.isFavorite) ? 0 : a.isFavorite ? -1 : 1;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredRules(filtered);
    setCurrentPage(1);
  }, [rules, searchTerm, categoryFilter, difficultyFilter, showFavoritesOnly, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortRules();
  }, [filterAndSortRules]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRules.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRules = filteredRules.slice(indexOfFirstItem, indexOfLastItem);

  const handleDeleteRule = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this grammar rule?')) {
      try {
        await deleteGrammarRule(id);
        showToast('Rule deleted successfully');
        await loadRules();
        await loadStats();
      } catch (err: any) {
        console.error('Error deleting grammar rule:', err);
        showToast(err.message || 'Failed to delete grammar rule', 'error');
      }
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleGrammarRuleFavorite(id);
      await loadRules();
      await loadStats();
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      showToast(err.message || 'Failed to toggle favorite', 'error');
    }
  };

  const handleCreateRule = async (ruleData: CreateGrammarRuleRequest) => {
    try {
      setIsCreating(true);
      await createGrammarRule(ruleData);
      showToast('Grammar rule created!');
      setShowCreateForm(false);
      await loadRules();
      await loadStats();
    } catch (err: any) {
      console.error('Error creating grammar rule:', err);
      showToast(err.message || 'Failed to create rule', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateRule = async (id: string, ruleData: UpdateGrammarRuleRequest) => {
    try {
      setIsUpdating(true);
      await updateGrammarRule(id, ruleData);
      showToast('Grammar rule updated!');
      setEditingRule(null);
      await loadRules();
      await loadStats();
    } catch (err: any) {
      console.error('Error updating grammar rule:', err);
      showToast(err.message || 'Failed to update rule', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSortChange = (newSortBy: 'title' | 'category' | 'difficulty' | 'favorites') => {
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
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className={styles.paginationButton}
        >
          <ChevronLeft size={18} /> Previous
        </button>

        <div className={styles.pageNumbers}>
          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className={styles.pageNumber}
              >
                1
              </button>
              {startPage > 2 && <span className={styles.pageDots}>...</span>}
            </>
          )}

          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`${styles.pageNumber} ${currentPage === number ? styles.activePage : ''}`}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className={styles.pageDots}>...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={styles.pageNumber}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className={styles.paginationButton}
        >
          Next <ChevronRight size={18} />
        </button>
      </div>
    );
  };

  if (loading && rules.length === 0) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.loading}>
          <Activity className={styles.spinning} /> Loading grammar rules...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Grammar Rules</h1>
          <p className={styles.subtitle}>Master English grammar with detailed explanations and examples</p>
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

      {stats && (
        <section className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Book size={24} />
            </div>
            <span className={styles.statNumber}>{stats.totalRules}</span>
            <span className={styles.statLabel}>Total Rules</span>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Star size={24} />
            </div>
            <span className={styles.statNumber}>{stats.favoriteRules}</span>
            <span className={styles.statLabel}>Favorites</span>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <Activity size={24} />
            </div>
            <span className={styles.statNumber}>{filteredRules.length}</span>
            <span className={styles.statLabel}>Filtered</span>
          </div>
        </section>
      )}

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search grammar rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <Layers className={styles.filterIcon} size={18} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Categories</option>
              <option value="tenses">Tenses</option>
              <option value="verbs">Verbs</option>
              <option value="nouns">Nouns</option>
              <option value="adjectives">Adjectives</option>
              <option value="adverbs">Adverbs</option>
              <option value="pronouns">Pronouns</option>
              <option value="prepositions">Prepositions</option>
              <option value="conditionals">Conditionals</option>
              <option value="passive-voice">Passive Voice</option>
              <option value="word-order">Word Order</option>
              <option value="articles">Articles</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <Activity className={styles.filterIcon} size={18} />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="elementary">Elementary</option>
              <option value="intermediate">Intermediate</option>
              <option value="upper-intermediate">Upper Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className={styles.sortControls}>
            <button
              onClick={() => handleSortChange('title')}
              className={`${styles.sortButton} ${sortBy === 'title' ? styles.activeSort : ''}`}
            >
              A-Z
            </button>
            <button
              onClick={() => handleSortChange('difficulty')}
              className={`${styles.sortButton} ${sortBy === 'difficulty' ? styles.activeSort : ''}`}
            >
              Level
            </button>
            <button
              onClick={() => handleSortChange('favorites')}
              className={`${styles.sortButton} ${sortBy === 'favorites' ? styles.activeSort : ''}`}
            >
              <Star size={14} />
            </button>
          </div>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            />
            Favorites only
          </label>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className={styles.createButton}
        >
          <Plus size={20} /> Add Rule
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          <List size={16} /> Showing {currentRules.length} of {filteredRules.length} rules
        </span>
        <div className={styles.itemsPerPage}>
          <label>Show:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className={styles.itemsSelect}
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>

      <div className={styles.rulesGrid}>
        {currentRules.map((rule) => (
          <GrammarRuleCard
            key={rule._id}
            rule={rule}
            onEdit={() => setEditingRule(rule)}
            onDelete={() => handleDeleteRule(rule._id)}
            onToggleFavorite={() => handleToggleFavorite(rule._id)}
          />
        ))}
      </div>

      {renderPagination()}

      {filteredRules.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FileText size={48} />
          </div>
          <p>No grammar rules found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setDifficultyFilter('');
              setShowFavoritesOnly(false);
            }}
            className={styles.submitButton}
          >
            Clear all filters
          </button>
        </div>
      )}

      {showCreateForm && (
        <GrammarRuleFormModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateRule}
          title="Add New Grammar Rule"
          isLoading={isCreating}
          isOpen={showCreateForm}
        />
      )}

      {editingRule && (
        <GrammarRuleFormModal
          rule={editingRule}
          onClose={() => setEditingRule(null)}
          onSubmit={(data) => handleUpdateRule(editingRule._id, data)}
          title="Edit Grammar Rule"
          isLoading={isUpdating}
          isOpen={!!editingRule}
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

interface GrammarRuleCardProps {
  rule: GrammarRule;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

const GrammarRuleCard: React.FC<GrammarRuleCardProps> = ({ rule, onEdit, onDelete, onToggleFavorite }) => {
  const renderHighlightedText = (text: string, highlightedWords: HighlightedWord[]) => {
    if (!highlightedWords || !highlightedWords.length) return text;

    let result = text;
    highlightedWords.forEach(hw => {
      const regex = new RegExp(`\\b${hw.word}\\b`, 'gi');
      result = result.replace(regex, `<mark style="background-color: ${hw.color || 'rgba(102, 126, 234, 0.4)'}; color: white; padding: 0 4px; border-radius: 4px;">${hw.word}</mark>`);
    });

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  return (
    <div className={styles.ruleCard}>
      <header className={styles.ruleHeader}>
        <div className={styles.ruleMeta}>
          <span className={styles.category}>
            {rule.category.replace('-', ' ')}
          </span>
          <span className={`${styles.difficulty} ${styles[rule.difficulty]}`}>
            {rule.difficulty}
          </span>
        </div>
        <div className={styles.ruleActions}>
          <button
            onClick={onToggleFavorite}
            className={`${styles.favoriteAction} ${rule.isFavorite ? styles.isFavorite : ''}`}
          >
            <Heart size={18} fill={rule.isFavorite ? "#ff6384" : "none"} color={rule.isFavorite ? "#ff6384" : "rgba(255, 255, 255, 0.4)"} />
          </button>
          <button onClick={onEdit} className={`${styles.actionButton} ${styles.editButton}`}>
            Editar
          </button>
          <button onClick={onDelete} className={`${styles.actionButton} ${styles.deleteButton}`}>
            Eliminar
          </button>
        </div>
      </header>

      <div className={styles.ruleContent}>
        <h3 className={styles.ruleTitle}>{rule.title}</h3>
        <p className={styles.ruleDescription}>{rule.description}</p>

        {rule.structure && (
          <div className={styles.ruleStructure}>
            <h4><Layers size={14} /> Structure</h4>
            <p>{renderHighlightedText(rule.structure, rule.highlightedWords)}</p>
          </div>
        )}

        <div className={styles.ruleExplanation}>
          <h4><Info size={14} /> Explanation</h4>
          <p>{renderHighlightedText(rule.explanation, rule.highlightedWords)}</p>
        </div>

        {rule.examples && rule.examples.length > 0 && (
          <div className={styles.ruleExamples}>
            <h4><CheckCircle size={14} /> Examples</h4>
            {rule.examples.slice(0, 2).map((example, index) => (
              <div key={index} className={styles.example}>
                <div className={styles.correctExample}>
                  <Check size={14} /> {renderHighlightedText(example.correct, rule.highlightedWords)}
                </div>
                {example.incorrect && (
                  <div className={styles.incorrectExample}>
                    <X size={14} /> {renderHighlightedText(example.incorrect, rule.highlightedWords)}
                  </div>
                )}
              </div>
            ))}
            {rule.examples.length > 2 && (
              <span className={styles.moreVocabulary}>+{rule.examples.length - 2} more examples</span>
            )}
          </div>
        )}

        {rule.relatedVocabulary && rule.relatedVocabulary.length > 0 && (
          <div className={styles.relatedVocabulary}>
            <h4><Book size={14} /> Related Vocabulary</h4>
            <div className={styles.vocabularyTags}>
              {rule.relatedVocabulary.slice(0, 4).map((vocab) => (
                <span key={vocab} className={styles.vocabularyTag}>
                  {vocab}
                </span>
              ))}
              {rule.relatedVocabulary.length > 4 && (
                <span className={styles.moreVocabulary}>+{rule.relatedVocabulary.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        {rule.notes && (
          <div className={styles.ruleNotes}>
            <h4><Plus size={14} /> Notes</h4>
            <p>{rule.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Re-using Info and CheckCircle for clarity within the component
const Info = ({ size }: { size: number }) => <AlertCircle size={size} />;
const CheckCircle = ({ size }: { size: number }) => <Activity size={size} />;

interface GrammarRuleFormModalProps {
  rule?: GrammarRule;
  onClose: () => void;
  onSubmit: (data: CreateGrammarRuleRequest) => Promise<void>;
  title: string;
  isLoading?: boolean;
  isOpen: boolean;
}

const GrammarRuleFormModal: React.FC<GrammarRuleFormModalProps> = ({
  rule,
  onClose,
  onSubmit,
  title,
  isLoading = false,
  isOpen
}) => {
  const [formData, setFormData] = useState<CreateGrammarRuleRequest>({
    title: '',
    category: 'tenses',
    difficulty: 'beginner',
    description: '',
    explanation: '',
    structure: '',
    examples: [{ correct: '', incorrect: '', explanation: '' }],
    highlightedWords: [],
    relatedVocabulary: [],
    notes: '',
    tags: []
  });

  const [newHighlightedWord, setNewHighlightedWord] = useState('');
  const [newVocabulary, setNewVocabulary] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (rule) {
      setFormData({
        title: rule.title,
        category: rule.category,
        difficulty: rule.difficulty,
        description: rule.description,
        explanation: rule.explanation,
        structure: rule.structure,
        examples: rule.examples.length > 0 ? rule.examples : [{ correct: '', incorrect: '', explanation: '' }],
        highlightedWords: rule.highlightedWords || [],
        relatedVocabulary: rule.relatedVocabulary || [],
        notes: rule.notes || '',
        tags: rule.tags || []
      });
    } else {
      setFormData({
        title: '',
        category: 'tenses',
        difficulty: 'beginner',
        description: '',
        explanation: '',
        structure: '',
        examples: [{ correct: '', incorrect: '', explanation: '' }],
        highlightedWords: [],
        relatedVocabulary: [],
        notes: '',
        tags: []
      });
    }
  }, [rule, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (field: keyof CreateGrammarRuleRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExampleChange = (index: number, field: 'correct' | 'incorrect' | 'explanation', value: string) => {
    const newExamples = [...formData.examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setFormData(prev => ({ ...prev, examples: newExamples }));
  };

  const addExample = () => {
    setFormData(prev => ({ ...prev, examples: [...prev.examples, { correct: '', incorrect: '', explanation: '' }] }));
  };

  const removeExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const addHighlightedWord = () => {
    if (newHighlightedWord.trim() && !formData.highlightedWords.some(hw => hw.word === newHighlightedWord.trim())) {
      setFormData(prev => ({
        ...prev,
        highlightedWords: [...prev.highlightedWords, { word: newHighlightedWord.trim(), color: '#667eea' }]
      }));
      setNewHighlightedWord('');
    }
  };

  const addVocabulary = () => {
    if (newVocabulary.trim() && !formData.relatedVocabulary.includes(newVocabulary.trim())) {
      setFormData(prev => ({
        ...prev,
        relatedVocabulary: [...prev.relatedVocabulary, newVocabulary.trim()]
      }));
      setNewVocabulary('');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2>{rule ? <Edit2 size={24} /> : <Plus size={24} />} {title}</h2>
          <button className={styles.closeButton} onClick={onClose}><X size={24} /></button>
        </header>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="e.g., Present Simple"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
              >
                <option value="tenses">Tenses</option>
                <option value="verbs">Verbs</option>
                <option value="nouns">Nouns</option>
                <option value="adjectives">Adjectives</option>
                <option value="adverbs">Adverbs</option>
                <option value="pronouns">Pronouns</option>
                <option value="prepositions">Prepositions</option>
                <option value="conditionals">Conditionals</option>
                <option value="passive-voice">Passive Voice</option>
                <option value="word-order">Word Order</option>
                <option value="articles">Articles</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="elementary">Elementary</option>
                <option value="intermediate">Intermediate</option>
                <option value="upper-intermediate">Upper Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                placeholder="Short description of the rule"
              />
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
            <label>Explanation</label>
            <textarea
              value={formData.explanation}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              required
              placeholder="Detailed explanation of how the rule works..."
              rows={4}
            />
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
            <label>Structure</label>
            <input
              type="text"
              value={formData.structure}
              onChange={(e) => handleInputChange('structure', e.target.value)}
              placeholder="e.g., Subject + Verb (s/es) + Object"
            />
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
            <label>Examples</label>
            {formData.examples.map((example, index) => (
              <div key={index} className={styles.example} style={{ marginBottom: '1rem', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                  <input
                    style={{ flex: 1 }}
                    placeholder="Correct example"
                    value={example.correct}
                    onChange={(e) => handleExampleChange(index, 'correct', e.target.value)}
                  />
                  <input
                    style={{ flex: 1 }}
                    placeholder="Incorrect (optional)"
                    value={example.incorrect}
                    onChange={(e) => handleExampleChange(index, 'incorrect', e.target.value)}
                  />
                  {formData.examples.length > 1 && (
                    <button type="button" onClick={() => removeExample(index)} className={styles.deleteButton} style={{ padding: '0.5rem' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <textarea
                  placeholder="Example explanation (optional)"
                  value={example.explanation}
                  onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                  rows={2}
                />
              </div>
            ))}
            <button type="button" onClick={addExample} className={styles.cancelButton} style={{ width: 'fit-content' }}>
              <Plus size={16} /> Add Example
            </button>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Highlight Words</label>
              <div className={styles.tagInput}>
                <input
                  value={newHighlightedWord}
                  onChange={e => setNewHighlightedWord(e.target.value)}
                  placeholder="Word to highlight"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addHighlightedWord())}
                />
                <button type="button" onClick={addHighlightedWord}>Add</button>
              </div>
              <div className={styles.vocabularyTags}>
                {formData.highlightedWords.map(hw => (
                  <span key={hw.word} className={styles.vocabularyTag} style={{ background: hw.color }}>
                    {hw.word} <X size={12} onClick={() => setFormData(p => ({ ...p, highlightedWords: p.highlightedWords.filter(h => h.word !== hw.word) }))} style={{ cursor: 'pointer' }} />
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Related Vocab</label>
              <div className={styles.tagInput}>
                <input
                  value={newVocabulary}
                  onChange={e => setNewVocabulary(e.target.value)}
                  placeholder="Add related word"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addVocabulary())}
                />
                <button type="button" onClick={addVocabulary}>Add</button>
              </div>
              <div className={styles.vocabularyTags}>
                {formData.relatedVocabulary.map(v => (
                  <span key={v} className={styles.vocabularyTag}>
                    {v} <X size={12} onClick={() => setFormData(p => ({ ...p, relatedVocabulary: p.relatedVocabulary.filter(item => item !== v) }))} style={{ cursor: 'pointer' }} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <footer className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? <Activity className={styles.spinning} size={18} /> : <Save size={18} />}
              {rule ? 'Update Rule' : 'Save Rule'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default Grammar;