import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  toggleMovieFavorite,
  uploadMoviePoster,
  addMovieQuote,
  deleteMovieQuote,
  getMovieStats
} from '../../api/movies.api';
import type { Movie, CreateMovieRequest, UpdateMovieRequest, AddQuoteRequest, MovieQuote } from '../../types';
import {
  Film,
  Plus,
  Heart,
  Search,
  Layers,
  MessageSquare,
  Award,
  Check,
  X,
  AlertCircle,
  BookOpen,
  Upload,
  Trash2,
  Info
} from 'lucide-react';
import videoHusky13 from '../../assets/videos/video-husky13.mp4';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import styles from './Movies.module.css';

// ── Component ────────────────────────────────────────────────────────────────

export const Movies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState<string | null>(null); // movieId
  const [expandedMovie, setExpandedMovie] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ── Data loading ───────────────────────────────────────────────────────

  const loadMovies = useCallback(async () => {
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (showFavoritesOnly) params.isFavorite = true;
      const response = await getAllMovies(params);
      setMovies(response.movies);
    } catch {
      showToast('Error loading movies', 'error');
    }
  }, [searchTerm, showFavoritesOnly]);

  const loadStats = async () => {
    try {
      const response = await getMovieStats();
      setStats(response.stats);
    } catch { /* stats unavailable */ }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadMovies(), loadStats()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => { loadMovies(); }, [searchTerm, showFavoritesOnly, loadMovies]);

  // ── Actions ────────────────────────────────────────────────────────────

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateMovie = async (data: CreateMovieRequest) => {
    try {
      await createMovie(data);
      setShowMovieModal(false);
      loadMovies(); loadStats();
      showToast('Movie added successfully', 'success');
    } catch { showToast('Error creating movie', 'error'); }
  };

  const handleUpdateMovie = async (id: string, data: UpdateMovieRequest) => {
    try {
      await updateMovie(id, data);
      setShowMovieModal(false); setEditingMovie(null);
      loadMovies();
      showToast('Movie updated successfully', 'success');
    } catch { showToast('Error updating movie', 'error'); }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;
    try {
      await deleteMovie(id);
      loadMovies(); loadStats();
      showToast('Movie deleted successfully', 'success');
    } catch { showToast('Error deleting movie', 'error'); }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleMovieFavorite(id);
      loadMovies(); loadStats();
    } catch { showToast('Error updating favorite', 'error'); }
  };

  const handleUploadPoster = async (movieId: string, file: File) => {
    try {
      await uploadMoviePoster(movieId, file);
      loadMovies();
      showToast('Poster uploaded successfully', 'success');
    } catch { showToast('Error uploading poster', 'error'); }
  };

  const handleAddQuote = async (movieId: string, data: AddQuoteRequest) => {
    try {
      await addMovieQuote(movieId, data);
      setShowQuoteModal(null);
      loadMovies(); loadStats();
      showToast('Quote added successfully', 'success');
    } catch { showToast('Error adding quote', 'error'); }
  };

  const handleDeleteQuote = async (movieId: string, quoteIndex: number) => {
    if (!confirm('Delete this quote?')) return;
    try {
      await deleteMovieQuote(movieId, quoteIndex);
      loadMovies(); loadStats();
      showToast('Quote deleted', 'success');
    } catch { showToast('Error deleting quote', 'error'); }
  };

  if (loading) return <LoadingOverlay message="Loading movies..." />;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className={`${styles.pageContent} page-entrance`}>
      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Movies & TV</h1>
          <p className={styles.subtitle}>Track movies you've watched and save memorable quotes</p>
        </div>
        <div className={styles.huskyContainer}>
          <video src={videoHusky13} autoPlay loop muted playsInline className={styles.huskyVideo} />
        </div>
      </header>

      {/* ── STATS ── */}
      {stats && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--gradient-primary)' }}>
              <Film size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{stats.totalMovies}</span>
              <span className={styles.statLabel}>Total Movies</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--gradient-secondary)' }}>
              <Heart size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{stats.favoriteMovies}</span>
              <span className={styles.statLabel}>Favorites</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--gradient-success)' }}>
              <MessageSquare size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{stats.totalQuotes}</span>
              <span className={styles.statLabel}>Quotes</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
              <Search size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{movies.length}</span>
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
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
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
          onClick={() => { setEditingMovie(null); setShowMovieModal(true); }}
          className={styles.createButton}
        >
          + Add Movie
        </button>
      </div>

      {/* ── RESULTS INFO ── */}
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          Showing {movies.length} movie{movies.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── MOVIES GRID ── */}
      <div className={styles.moviesGrid}>
        {movies.length > 0 ? (
          movies.map((movie) => (
            <div key={movie._id} className={styles.movieCard}>
              {/* Poster */}
              <div className={styles.moviePoster}>
                {movie.posterImage ? (
                  <img src={movie.posterImage} alt={movie.title} className={styles.posterImg} />
                ) : (
                  <div className={styles.posterPlaceholder}>
                    <Film size={48} />
                    <label className={styles.uploadLabel}>
                      <Upload size={14} /> Upload Poster
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleUploadPoster(movie._id, e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={styles.movieContent}>
                <h3 className={styles.movieTitle}>{movie.title}</h3>

                <div className={styles.opinionSection}>
                  <Info size={14} />
                  <p className={styles.movieOpinion}>{movie.opinion}</p>
                </div>

                {/* Quotes Preview */}
                {movie.quotes.length > 0 && (
                  <div className={styles.quotesPreview}>
                    <div className={styles.quotesHeader}>
                      <BookOpen size={16} />
                      <h4>{movie.quotes.length} Quote{movie.quotes.length !== 1 ? 's' : ''}</h4>
                      <button
                        className={styles.toggleQuotesBtn}
                        onClick={() => setExpandedMovie(expandedMovie === movie._id ? null : movie._id)}
                      >
                        {expandedMovie === movie._id ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {expandedMovie === movie._id && (
                      <div className={styles.quotesList}>
                        {movie.quotes.map((quote, idx) => (
                          <div key={idx} className={styles.quoteItem}>
                            <div className={styles.quoteContent}>
                              <p className={styles.quoteText}>"{quote.text}"</p>
                              {quote.translation && (
                                <p className={styles.quoteTranslation}>{quote.translation}</p>
                              )}
                              {quote.character && (
                                <span className={styles.quoteCharacter}>— {quote.character}</span>
                              )}
                            </div>
                            <button
                              className={styles.removeQuoteBtn}
                              onClick={() => handleDeleteQuote(movie._id, idx)}
                              title="Delete quote"
                            >
                              <Plus size={14} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={styles.movieActions}>
                <button
                  className={`${styles.favoriteAction} ${movie.isFavorite ? styles.isFavorite : ''}`}
                  onClick={() => handleToggleFavorite(movie._id)}
                  title={movie.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={18} fill={movie.isFavorite ? "#ff6384" : "none"} color={movie.isFavorite ? "#ff6384" : "rgba(255, 255, 255, 0.4)"} />
                </button>
                <div className={styles.mainActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => setShowQuoteModal(movie._id)}
                  >
                    + Quote
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={() => { setEditingMovie(movie); setShowMovieModal(true); }}
                  >
                    Editar
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDeleteMovie(movie._id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <Film size={48} />
            <p>No movies found</p>
            <button
              onClick={() => { setEditingMovie(null); setShowMovieModal(true); }}
              className={styles.primaryButton}
            >
              Add your first movie
            </button>
          </div>
        )}
      </div>

      {/* ── MOVIE MODAL ── */}
      {showMovieModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowMovieModal(false); setEditingMovie(null); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h2>
              <button onClick={() => { setShowMovieModal(false); setEditingMovie(null); }} className={styles.closeButton}>×</button>
            </div>
            <form
              className={styles.modalForm}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const data = {
                  title: fd.get('title') as string,
                  opinion: fd.get('opinion') as string,
                };
                editingMovie
                  ? handleUpdateMovie(editingMovie._id, data)
                  : handleCreateMovie(data);
              }}
            >
              <div className={styles.formSection}>
                <div className={styles.sectionTitleLabel}>Movie Details</div>
                <div className={styles.formGroup}>
                  <label>Title</label>
                  <input
                    name="title"
                    type="text"
                    defaultValue={editingMovie?.title}
                    placeholder="e.g. The Shawshank Redemption"
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Your Opinion / Review</label>
                  <textarea
                    name="opinion"
                    defaultValue={editingMovie?.opinion}
                    placeholder="What did you think about this movie? What did you learn?"
                    required
                    rows={4}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => { setShowMovieModal(false); setEditingMovie(null); }}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingMovie ? 'Update Movie' : 'Add Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── QUOTE MODAL ── */}
      {showQuoteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowQuoteModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Quote</h2>
              <button onClick={() => setShowQuoteModal(null)} className={styles.closeButton}>×</button>
            </div>
            <form
              className={styles.modalForm}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                handleAddQuote(showQuoteModal, {
                  text: fd.get('text') as string,
                  translation: fd.get('translation') as string || undefined,
                  character: fd.get('character') as string || undefined,
                  timestamp: fd.get('timestamp') as string || undefined,
                });
              }}
            >
              <div className={styles.formSection}>
                <div className={styles.sectionTitleLabel}>Quote Details</div>
                <div className={styles.formGroup}>
                  <label>Quote Text (English)</label>
                  <textarea name="text" placeholder="Enter the quote..." required rows={3} className={styles.formInput} />
                </div>
                <div className={styles.formGroupRow}>
                  <div className={styles.formGroup}>
                    <label>Translation (Spanish)</label>
                    <input name="translation" type="text" placeholder="Optional translation" className={styles.formInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Character</label>
                    <input name="character" type="text" placeholder="Who said it?" className={styles.formInput} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Timestamp (Optional)</label>
                  <input name="timestamp" type="text" placeholder="e.g. 01:23:45" className={styles.formInput} />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setShowQuoteModal(null)}>Cancel</button>
                <button type="submit" className={styles.submitButton}>Add Quote</button>
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

export default Movies;