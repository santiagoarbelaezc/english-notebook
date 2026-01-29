import React, { useState, useEffect } from 'react';
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState<'title' | 'category' | 'difficulty' | 'favorites'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadRules();
    loadStats();
  }, []);

  useEffect(() => {
    filterAndSortRules();
  }, [rules, searchTerm, categoryFilter, difficultyFilter, showFavoritesOnly, sortBy, sortOrder]);

  const loadRules = async () => {
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
  };

  const loadStats = async () => {
    try {
      const response = await getGrammarStats();
      setStats(response.stats);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  const filterAndSortRules = () => {
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
          const difficultyOrder = { 'beginner': 1, 'elementary': 2, 'intermediate': 3, 'upper-intermediate': 4, 'advanced': 5 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
        case 'favorites':
          comparison = (a.isFavorite === b.isFavorite) ? 0 : a.isFavorite ? -1 : 1;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredRules(filtered);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredRules.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRules = filteredRules.slice(indexOfFirstItem, indexOfLastItem);

  const handleDeleteRule = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this grammar rule?')) {
      try {
        await deleteGrammarRule(id);
        await loadRules();
        await loadStats();
      } catch (err: any) {
        console.error('Error deleting grammar rule:', err);
        setError(err.message || 'Failed to delete grammar rule');
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
      setError(err.message || 'Failed to toggle favorite');
    }
  };

  const handleCreateRule = async (ruleData: CreateGrammarRuleRequest | UpdateGrammarRuleRequest) => {
    try {
      setIsCreating(true);
      await createGrammarRule(ruleData as CreateGrammarRuleRequest);
      setShowCreateForm(false);
      await loadRules();
      await loadStats();
    } catch (err: any) {
      console.error('Error creating grammar rule:', err);
      setError(err.message || 'Failed to create grammar rule');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateRule = async (id: string, ruleData: UpdateGrammarRuleRequest) => {
    try {
      setIsUpdating(true);
      await updateGrammarRule(id, ruleData);
      setEditingRule(null);
      await loadRules();
    } catch (err: any) {
      console.error('Error updating grammar rule:', err);
      setError(err.message || 'Failed to update grammar rule');
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
          ← Previous
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
          Next →
        </button>
      </div>
    );
  };

  if (loading && rules.length === 0) {
    return <div className={styles.loading}>Loading grammar rules...</div>;
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.header}>
        <h1 className={styles.title}>Grammar Rules</h1>
        <p className={styles.subtitle}>Master English grammar with detailed explanations</p>
      </div>

      {stats && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.totalRules}</span>
            <span className={styles.statLabel}>Total Rules</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.favoriteRules}</span>
            <span className={styles.statLabel}>Favorites</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{filteredRules.length}</span>
            <span className={styles.statLabel}>Showing</span>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search grammar rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
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

          <div className={styles.sortControls}>
            <span className={styles.sortLabel}>Sort by:</span>
            <button
              onClick={() => handleSortChange('title')}
              className={`${styles.sortButton} ${sortBy === 'title' ? styles.activeSort : ''}`}
            >
              A-Z {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('category')}
              className={`${styles.sortButton} ${sortBy === 'category' ? styles.activeSort : ''}`}
            >
              Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('difficulty')}
              className={`${styles.sortButton} ${sortBy === 'difficulty' ? styles.activeSort : ''}`}
            >
              Level {sortBy === 'difficulty' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('favorites')}
              className={`${styles.sortButton} ${sortBy === 'favorites' ? styles.activeSort : ''}`}
            >
              Favorites {sortBy === 'favorites' && (sortOrder === 'asc' ? '↑' : '↓')}
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
          + Add Rule
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          Showing {currentRules.length} of {filteredRules.length} rules
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
            <option value={96}>96</option>
          </select>
          <span>per page</span>
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
          <p>No grammar rules found</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className={styles.primaryButton}
          >
            Add your first rule
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
    if (!highlightedWords.length) return text;

    let result = text;
    highlightedWords.forEach(hw => {
      const regex = new RegExp(`\\b${hw.word}\\b`, 'gi');
      result = result.replace(regex, `<mark style="background-color: ${hw.color}">${hw.word}</mark>`);
    });

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  return (
    <div className={styles.ruleCard}>
      <div className={styles.ruleHeader}>
        <div className={styles.ruleMeta}>
          <span className={`${styles.category} ${styles[rule.category]}`}>
            {rule.category.replace('-', ' ').toUpperCase()}
          </span>
          <span className={`${styles.difficulty} ${styles[rule.difficulty]}`}>
            {rule.difficulty.toUpperCase()}
          </span>
        </div>
        <div className={styles.ruleActions}>
          <button
            onClick={onToggleFavorite}
            className={`${styles.favoriteButton} ${rule.isFavorite ? styles.favorited : ''}`}
            title={rule.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            ★
          </button>
          <button onClick={onEdit} className={styles.editButton} title="Edit rule">
            ✏️
          </button>
          <button onClick={onDelete} className={styles.deleteButton} title="Delete rule">
            🗑️
          </button>
        </div>
      </div>

      <div className={styles.ruleContent}>
        <h3 className={styles.ruleTitle}>{rule.title}</h3>
        <p className={styles.ruleDescription}>{rule.description}</p>

        {rule.structure && (
          <div className={styles.ruleStructure}>
            <h4>Structure:</h4>
            <p>{renderHighlightedText(rule.structure, rule.highlightedWords)}</p>
          </div>
        )}

        <div className={styles.ruleExplanation}>
          <h4>Explanation:</h4>
          <p>{renderHighlightedText(rule.explanation, rule.highlightedWords)}</p>
        </div>

        {rule.examples.length > 0 && (
          <div className={styles.ruleExamples}>
            <h4>Examples:</h4>
            {rule.examples.slice(0, 3).map((example, index) => (
              <div key={index} className={styles.example}>
                <div className={styles.correctExample}>
                  ✓ {renderHighlightedText(example.correct, rule.highlightedWords)}
                </div>
                {example.incorrect && (
                  <div className={styles.incorrectExample}>
                    ✗ {renderHighlightedText(example.incorrect, rule.highlightedWords)}
                  </div>
                )}
                {example.explanation && (
                  <div className={styles.exampleExplanation}>
                    💡 {example.explanation}
                  </div>
                )}
              </div>
            ))}
            {rule.examples.length > 3 && (
              <span className={styles.moreExamples}>+{rule.examples.length - 3} more</span>
            )}
          </div>
        )}

        {rule.relatedVocabulary.length > 0 && (
          <div className={styles.relatedVocabulary}>
            <h4>Related Vocabulary:</h4>
            <div className={styles.vocabularyTags}>
              {rule.relatedVocabulary.slice(0, 5).map((vocab) => (
                <span key={vocab} className={styles.vocabularyTag}>
                  {vocab}
                </span>
              ))}
              {rule.relatedVocabulary.length > 5 && (
                <span className={styles.moreVocabulary}>+{rule.relatedVocabulary.length - 5} more</span>
              )}
            </div>
          </div>
        )}

        {rule.notes && (
          <div className={styles.ruleNotes}>
            <h4>Notes:</h4>
            <p>{rule.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface GrammarRuleFormModalProps {
  rule?: GrammarRule;
  onClose: () => void;
  onSubmit: (data: CreateGrammarRuleRequest | UpdateGrammarRuleRequest) => Promise<void>;
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

  const [newExample, setNewExample] = useState('');
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
        highlightedWords: rule.highlightedWords,
        relatedVocabulary: rule.relatedVocabulary,
        notes: rule.notes || '',
        tags: rule.tags
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
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      console.error('Error submitting form:', err);
    }
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
        highlightedWords: [...prev.highlightedWords, { word: newHighlightedWord.trim(), color: 'yellow' }]
      }));
      setNewHighlightedWord('');
    }
  };

  const removeHighlightedWord = (word: string) => {
    setFormData(prev => ({
      ...prev,
      highlightedWords: prev.highlightedWords.filter(hw => hw.word !== word)
    }));
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

  const removeVocabulary = (vocab: string) => {
    setFormData(prev => ({
      ...prev,
      relatedVocabulary: prev.relatedVocabulary.filter(v => v !== vocab)
    }));
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

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="e.g., Present Simple"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Category *</label>
              <select
                id="category"
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
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="tags">Tags</label>
              <div className={styles.tagInput}>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button type="button" onClick={addTag}>Add</button>
              </div>
              <div className={styles.tagList}>
                {formData.tags.map(tag => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              placeholder="Brief description of the grammar rule"
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="explanation">Explanation *</label>
            <textarea
              id="explanation"
              value={formData.explanation}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              required
              placeholder="Detailed explanation of how to use this grammar rule"
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="structure">Structure</label>
            <textarea
              id="structure"
              value={formData.structure}
              onChange={(e) => handleInputChange('structure', e.target.value)}
              placeholder="Grammar structure pattern (e.g., Subject + Verb + Object)"
              rows={2}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Examples</label>
            {formData.examples.map((example, index) => (
              <div key={index} className={styles.exampleInput}>
                <div className={styles.exampleFields}>
                  <div className={styles.exampleField}>
                    <label>Correct:</label>
                    <textarea
                      value={example.correct}
                      onChange={(e) => handleExampleChange(index, 'correct', e.target.value)}
                      placeholder="Correct example"
                      rows={2}
                    />
                  </div>
                  <div className={styles.exampleField}>
                    <label>Incorrect (optional):</label>
                    <textarea
                      value={example.incorrect || ''}
                      onChange={(e) => handleExampleChange(index, 'incorrect', e.target.value)}
                      placeholder="Incorrect example"
                      rows={2}
                    />
                  </div>
                  <div className={styles.exampleField}>
                    <label>Explanation (optional):</label>
                    <textarea
                      value={example.explanation || ''}
                      onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)}
                      placeholder="Explanation"
                      rows={2}
                    />
                  </div>
                </div>
                {formData.examples.length > 1 && (
                  <button type="button" onClick={() => removeExample(index)}>Remove Example</button>
                )}
              </div>
            ))}
            <div className={styles.addExample}>
              <input
                type="text"
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                placeholder="Add new example"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExample())}
              />
              <button type="button" onClick={addExample}>Add Example</button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Highlighted Words</label>
            <div className={styles.highlightedWordsInput}>
              <input
                type="text"
                value={newHighlightedWord}
                onChange={(e) => setNewHighlightedWord(e.target.value)}
                placeholder="Add word to highlight"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlightedWord())}
              />
              <button type="button" onClick={addHighlightedWord}>Add</button>
            </div>
            <div className={styles.highlightedWordsList}>
              {formData.highlightedWords.map((hw, index) => (
                <span key={hw.word} className={styles.highlightedWord}>
                  <span 
                    className={styles.highlightedWordText}
                    style={{ backgroundColor: hw.color }}
                  >
                    {hw.word}
                  </span>
                  <select
                    value={hw.color}
                    onChange={(e) => {
                      const newWords = [...formData.highlightedWords];
                      newWords[index] = { ...newWords[index], color: e.target.value };
                      setFormData(prev => ({ ...prev, highlightedWords: newWords }));
                    }}
                    className={styles.colorSelect}
                  >
                    <option value="yellow">Yellow</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="orange">Orange</option>
                    <option value="pink">Pink</option>
                  </select>
                  <button type="button" onClick={() => removeHighlightedWord(hw.word)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Related Vocabulary</label>
            <div className={styles.vocabularyInput}>
              <input
                type="text"
                value={newVocabulary}
                onChange={(e) => setNewVocabulary(e.target.value)}
                placeholder="Add related vocabulary"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVocabulary())}
              />
              <button type="button" onClick={addVocabulary}>Add</button>
            </div>
            <div className={styles.vocabularyList}>
              {formData.relatedVocabulary.map(vocab => (
                <span key={vocab} className={styles.vocabulary}>
                  {vocab}
                  <button type="button" onClick={() => removeVocabulary(vocab)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or tips"
              rows={3}
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? 'Saving...' : (rule ? 'Update Rule' : 'Create Rule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Grammar;