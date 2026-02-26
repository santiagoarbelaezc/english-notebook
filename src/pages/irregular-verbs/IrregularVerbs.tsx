import React, { useState, useEffect } from 'react';
import {
  getAllIrregularVerbs,
  createIrregularVerb,
  updateIrregularVerb,
  deleteIrregularVerb,
  toggleIrregularVerbFavorite,
  addIrregularVerbExample,
  removeIrregularVerbExample,
  getIrregularVerbsStats
} from '../../api';
import type { IrregularVerb, CreateIrregularVerbRequest, UpdateIrregularVerbRequest } from '../../types';
import {
  Search,
  Plus,
  Heart,
  Layers,
  Zap,
  BookOpen,
  Info
} from 'lucide-react';
import videoHusky7 from '../../assets/videos/video-husky7.mp4';
import styles from './IrregularVerbs.module.css';

interface VerbCardProps {
  verb: IrregularVerb;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onAddExample?: (verbId: string) => void;
  onRemoveExample?: (verbId: string, exampleIndex: number) => void;
}

export const IrregularVerbs: React.FC = () => {
  const [verbs, setVerbs] = useState<IrregularVerb[]>([]);
  const [filteredVerbs, setFilteredVerbs] = useState<IrregularVerb[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVerb, setEditingVerb] = useState<IrregularVerb | null>(null);
  const [addingExampleToVerb, setAddingExampleToVerb] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState<'infinitive' | 'difficulty' | 'favorites'>('infinitive');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadVerbs();
    loadStats();
  }, []);

  useEffect(() => {
    filterAndSortVerbs();
  }, [verbs, searchTerm, difficultyFilter, showFavoritesOnly, sortBy, sortOrder]);

  const loadVerbs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (showFavoritesOnly) params.isFavorite = true;

      const response = await getAllIrregularVerbs(params);
      setVerbs(response.verbs);
      setError(null);
    } catch (err: any) {
      console.error('Error loading verbs:', err);
      setError(err.message || 'Failed to load verbs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getIrregularVerbsStats();
      setStats(response.stats);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  const filterAndSortVerbs = () => {
    let filtered = [...verbs];

    // Aplicar filtros
    if (searchTerm) {
      filtered = filtered.filter(verb =>
        verb.infinitive.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verb.pastSimple.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verb.pastParticiple.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (difficultyFilter) {
      filtered = filtered.filter(verb => verb.difficulty === difficultyFilter);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(verb => verb.isFavorite);
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'infinitive':
          comparison = a.infinitive.localeCompare(b.infinitive);
          break;
        case 'difficulty':
          const difficultyOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
        case 'favorites':
          comparison = (a.isFavorite === b.isFavorite) ? 0 : a.isFavorite ? -1 : 1;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredVerbs(filtered);
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  };

  // Cálculo de paginación
  const totalPages = Math.ceil(filteredVerbs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVerbs = filteredVerbs.slice(indexOfFirstItem, indexOfLastItem);

  const handleCreateVerb = async (verbData: CreateIrregularVerbRequest) => {
    try {
      await createIrregularVerb(verbData);
      setShowCreateForm(false);
      await loadVerbs();
      await loadStats();
    } catch (err: any) {
      console.error('Error creating verb:', err);
      setError(err.message || 'Failed to create verb');
    }
  };

  const handleUpdateVerb = async (id: string, verbData: UpdateIrregularVerbRequest) => {
    try {
      await updateIrregularVerb(id, verbData);
      setEditingVerb(null);
      await loadVerbs();
    } catch (err: any) {
      console.error('Error updating verb:', err);
      setError(err.message || 'Failed to update verb');
    }
  };

  const handleDeleteVerb = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this verb?')) {
      try {
        await deleteIrregularVerb(id);
        await loadVerbs();
        await loadStats();
      } catch (err: any) {
        console.error('Error deleting verb:', err);
        setError(err.message || 'Failed to delete verb');
      }
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleIrregularVerbFavorite(id);
      await loadVerbs();
      await loadStats();
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      setError(err.message || 'Failed to toggle favorite');
    }
  };

  const handleAddExample = (verbId: string) => {
    setAddingExampleToVerb(verbId);
  };

  const handleSubmitAddExample = async (verbId: string, exampleData: { infinitive: string; pastSimple: string; pastParticiple: string }) => {
    try {
      await addIrregularVerbExample(verbId, exampleData);
      setAddingExampleToVerb(null);
      await loadVerbs();
      await loadStats();
    } catch (err: any) {
      console.error('Error adding example:', err);
      setError(err.message || 'Failed to add example');
    }
  };

  const handleRemoveExample = async (verbId: string, exampleIndex: number) => {
    if (window.confirm('Are you sure you want to remove this example?')) {
      try {
        await removeIrregularVerbExample(verbId, exampleIndex);
        await loadVerbs();
        await loadStats();
      } catch (err: any) {
        console.error('Error removing example:', err);
        setError(err.message || 'Failed to remove example');
      }
    }
  };

  const handleSortChange = (newSortBy: 'infinitive' | 'difficulty' | 'favorites') => {
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

  if (loading && verbs.length === 0) {
    return <div className={styles.loading}>Loading irregular verbs...</div>;
  }

  return (
    <div className={styles.pageContent}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Irregular Verbs</h1>
          <p className={styles.subtitle}>Master the most common irregular verbs</p>
        </div>
        <div className={styles.huskyContainer}>
          <video
            src={videoHusky7}
            autoPlay
            loop
            muted
            playsInline
            className={styles.huskyVideo}
          />
        </div>
      </header>

      {stats && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--gradient-primary)' }}>
              <Layers size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{stats.totalVerbs}</span>
              <span className={styles.statLabel}>Total Verbs</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--gradient-secondary)' }}>
              <Heart size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{stats.favoriteVerbs}</span>
              <span className={styles.statLabel}>Favorites</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--gradient-success)' }}>
              <Zap size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{stats.verbsWithExamples}</span>
              <span className={styles.statLabel}>With Examples</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
              <Search size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{filteredVerbs.length}</span>
              <span className={styles.statLabel}>Showing</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search verbs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Levels</option>
            <option value="A1">A1 - Beginner</option>
            <option value="A2">A2 - Elementary</option>
            <option value="B1">B1 - Intermediate</option>
            <option value="B2">B2 - Upper Intermediate</option>
            <option value="C1">C1 - Advanced</option>
            <option value="C2">C2 - Mastery</option>
          </select>

          <div className={styles.sortControls}>
            <span className={styles.sortLabel}>Sort by:</span>
            <button
              onClick={() => handleSortChange('infinitive')}
              className={`${styles.sortButton} ${sortBy === 'infinitive' ? styles.activeSort : ''}`}
            >
              A-Z {sortBy === 'infinitive' && (sortOrder === 'asc' ? '↑' : '↓')}
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
          + Add Verb
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          Showing {currentVerbs.length} of {filteredVerbs.length} verbs
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

      <div className={styles.verbsGrid}>
        {currentVerbs.map((verb) => (
          <VerbCard
            key={verb._id}
            verb={verb}
            onEdit={() => setEditingVerb(verb)}
            onDelete={() => handleDeleteVerb(verb._id)}
            onToggleFavorite={() => handleToggleFavorite(verb._id)}
            onAddExample={(verbId) => handleAddExample(verbId)}
            onRemoveExample={(verbId, exampleIndex) => handleRemoveExample(verbId, exampleIndex)}
          />
        ))}
      </div>

      {renderPagination()}

      {filteredVerbs.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <p>No irregular verbs found</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className={styles.primaryButton}
          >
            Add your first verb
          </button>
        </div>
      )}

      {showCreateForm && (
        <VerbFormModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateVerb}
          title="Add New Irregular Verb"
        />
      )}

      {editingVerb && (
        <VerbFormModal
          verb={editingVerb}
          onClose={() => setEditingVerb(null)}
          onSubmit={(data) => handleUpdateVerb(editingVerb._id, data)}
          title="Edit Irregular Verb"
        />
      )}

      {addingExampleToVerb && (
        <AddExampleModal
          verbId={addingExampleToVerb}
          onClose={() => setAddingExampleToVerb(null)}
          onSubmit={handleSubmitAddExample}
        />
      )}
    </div>
  );
};

const VerbCard: React.FC<VerbCardProps> = ({ verb, onEdit, onDelete, onToggleFavorite, onAddExample, onRemoveExample }) => {
  return (
    <div className={styles.verbCard}>
      <div className={styles.verbHeader}>
        <div className={styles.verbMeta}>
          <span className={`${styles.difficulty} ${styles[`difficulty${verb.difficulty}`]}`}>
            {verb.difficulty}
          </span>
        </div>
      </div>

      <div className={styles.verbContent}>
        {/* Nueva tabla horizontal para las formas del verbo */}
        <table className={styles.verbFormsTable}>
          <thead className={styles.verbFormsHeader}>
            <tr>
              <th>Infinitive</th>
              <th>Past Simple</th>
              <th>Past Participle</th>
            </tr>
          </thead>
          <tbody className={styles.verbFormsBody}>
            <tr>
              <td className={styles.verbFormValue}>{verb.infinitive}</td>
              <td className={styles.verbFormValue}>{verb.pastSimple}</td>
              <td className={styles.verbFormValue}>{verb.pastParticiple}</td>
            </tr>
          </tbody>
        </table>

        {verb.notes && (
          <div className={styles.verbNotes}>
            <Info size={14} />
            <p>{verb.notes}</p>
          </div>
        )}

        {verb.examples.length > 0 && (
          <div className={styles.verbExamples}>
            <div className={styles.examplesHeader}>
              <BookOpen size={16} />
              <h4>Examples:</h4>
            </div>
            {verb.examples.map((example, index) => (
              <div key={index} className={styles.example}>
                <div className={styles.exampleContent}>
                  <span className={styles.exampleWord}>{example.infinitive}</span>
                  <span className={styles.exampleArrow}>→</span>
                  <span className={styles.exampleWord}>{example.pastSimple}</span>
                  <span className={styles.exampleArrow}>→</span>
                  <span className={styles.exampleWord}>{example.pastParticiple}</span>
                </div>
                {onRemoveExample && (
                  <button
                    onClick={() => onRemoveExample(verb._id, index)}
                    className={styles.removeExampleButtonSmall}
                    title="Remove example"
                  >
                    <Plus size={14} style={{ transform: 'rotate(45deg)' }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {verb.examples.length === 0 && onAddExample && (
          <div className={styles.noExamples}>
            <button onClick={() => onAddExample(verb._id)} className={styles.addFirstExampleButton}>
              <Plus size={14} /> Add Example
            </button>
          </div>
        )}
      </div>

      <div className={styles.verbActions}>
        <button
          onClick={onToggleFavorite}
          className={`${styles.favoriteAction} ${verb.isFavorite ? styles.isFavorite : ''}`}
          title={verb.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={18} fill={verb.isFavorite ? "#ff6384" : "none"} color={verb.isFavorite ? "#ff6384" : "rgba(255, 255, 255, 0.4)"} />
        </button>
        <div className={styles.mainActions}>
          <button onClick={onEdit} className={styles.actionBtn} title="Editar verbo">
            Editar
          </button>
          {onAddExample && (
            <button onClick={() => onAddExample(verb._id)} className={styles.actionBtn} title="Añadir ejemplo">
              + Ejemplo
            </button>
          )}
          <button onClick={onDelete} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Eliminar verbo">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

interface VerbFormModalProps {
  verb?: IrregularVerb;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
}

const VerbFormModal: React.FC<VerbFormModalProps> = ({ verb, onClose, onSubmit, title }) => {
  const [formData, setFormData] = useState<CreateIrregularVerbRequest>({
    infinitive: verb?.infinitive || '',
    pastSimple: verb?.pastSimple || '',
    pastParticiple: verb?.pastParticiple || '',
    pronunciation: verb?.pronunciation || {},
    examples: verb?.examples || [],
    difficulty: verb?.difficulty || 'A1',
    notes: verb?.notes || ''
  });

  const [newExample, setNewExample] = useState({
    infinitive: '',
    pastSimple: '',
    pastParticiple: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddExample = () => {
    if (newExample.infinitive.trim() && newExample.pastSimple.trim() && newExample.pastParticiple.trim()) {
      setFormData(prev => ({
        ...prev,
        examples: [...(prev.examples || []), { ...newExample }]
      }));
      setNewExample({ infinitive: '', pastSimple: '', pastParticiple: '' });
    }
  };

  const handleRemoveExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: (prev.examples || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.verbForm}>
          {/* Sección de formas del verbo en horizontal */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Verb Forms</div>
            <div className={styles.verbFormsContainer}>
              <div className={styles.verbFormGroup}>
                <label>Infinitive</label>
                <input
                  type="text"
                  value={formData.infinitive}
                  onChange={(e) => handleChange('infinitive', e.target.value)}
                  required
                  placeholder="e.g., go"
                  className={styles.verbFormInput}
                />
              </div>
              <div className={styles.verbFormGroup}>
                <label>Past Simple</label>
                <input
                  type="text"
                  value={formData.pastSimple}
                  onChange={(e) => handleChange('pastSimple', e.target.value)}
                  required
                  placeholder="e.g., went"
                  className={styles.verbFormInput}
                />
              </div>
              <div className={styles.verbFormGroup}>
                <label>Past Participle</label>
                <input
                  type="text"
                  value={formData.pastParticiple}
                  onChange={(e) => handleChange('pastParticiple', e.target.value)}
                  required
                  placeholder="e.g., gone"
                  className={styles.verbFormInput}
                />
              </div>
            </div>
          </div>

          {/* Sección de nivel y notas */}
          <div className={styles.formGroupRow}>
            <div className={styles.formGroup}>
              <label>Difficulty Level</label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleChange('difficulty', e.target.value)}
                className={styles.verbFormInput}
              >
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Mastery</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                placeholder="Add any notes or tips about this verb..."
                className={styles.verbFormInput}
              />
            </div>
          </div>

          {/* Sección de ejemplos */}
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Examples</div>

            {/* Lista de ejemplos existentes */}
            {(formData.examples || []).length > 0 && (
              <div className={styles.examplesList}>
                {(formData.examples || []).map((example, index) => (
                  <div key={index} className={styles.exampleItem}>
                    <div className={styles.exampleForms}>
                      <span className={styles.exampleForm}>{example.infinitive}</span>
                      <span className={styles.exampleArrow}>→</span>
                      <span className={styles.exampleForm}>{example.pastSimple}</span>
                      <span className={styles.exampleArrow}>→</span>
                      <span className={styles.exampleForm}>{example.pastParticiple}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExample(index)}
                      className={styles.removeExampleButton}
                      title="Remove example"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Agregar nuevo ejemplo */}
            <div className={styles.addExampleSection}>
              <div className={styles.addExampleInputs}>
                <input
                  type="text"
                  placeholder="Infinitive (e.g., I go)"
                  value={newExample.infinitive}
                  onChange={(e) => setNewExample(prev => ({ ...prev, infinitive: e.target.value }))}
                  className={styles.verbFormInput}
                />
                <input
                  type="text"
                  placeholder="Past Simple (e.g., I went)"
                  value={newExample.pastSimple}
                  onChange={(e) => setNewExample(prev => ({ ...prev, pastSimple: e.target.value }))}
                  className={styles.verbFormInput}
                />
                <input
                  type="text"
                  placeholder="Past Participle (e.g., I have gone)"
                  value={newExample.pastParticiple}
                  onChange={(e) => setNewExample(prev => ({ ...prev, pastParticiple: e.target.value }))}
                  className={styles.verbFormInput}
                />
                <button
                  type="button"
                  onClick={handleAddExample}
                  className={styles.addExampleButton}
                  disabled={!newExample.infinitive.trim() || !newExample.pastSimple.trim() || !newExample.pastParticiple.trim()}
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              {verb ? 'Update' : 'Create'} Verb
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddExampleModalProps {
  verbId: string;
  onClose: () => void;
  onSubmit: (verbId: string, example: { infinitive: string; pastSimple: string; pastParticiple: string }) => void;
}

const AddExampleModal: React.FC<AddExampleModalProps> = ({ verbId, onClose, onSubmit }) => {
  const [example, setExample] = useState({
    infinitive: '',
    pastSimple: '',
    pastParticiple: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (example.infinitive.trim() && example.pastSimple.trim() && example.pastParticiple.trim()) {
      onSubmit(verbId, example);
      onClose();
    }
  };

  const handleChange = (field: string, value: string) => {
    setExample(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add Example</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.verbForm}>
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Example Forms</div>
            <div className={styles.addExampleInputs}>
              <input
                type="text"
                placeholder="Infinitive (e.g., I go)"
                value={example.infinitive}
                onChange={(e) => handleChange('infinitive', e.target.value)}
                required
                className={styles.verbFormInput}
              />
              <input
                type="text"
                placeholder="Past Simple (e.g., I went)"
                value={example.pastSimple}
                onChange={(e) => handleChange('pastSimple', e.target.value)}
                required
                className={styles.verbFormInput}
              />
              <input
                type="text"
                placeholder="Past Participle (e.g., I have gone)"
                value={example.pastParticiple}
                onChange={(e) => handleChange('pastParticiple', e.target.value)}
                required
                className={styles.verbFormInput}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!example.infinitive.trim() || !example.pastSimple.trim() || !example.pastParticiple.trim()}
            >
              Add Example
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IrregularVerbs;