import {
  Film,
  Clock,
  Plus,
  Heart,
  Search,
  Filter,
  Video,
  Clapperboard,
  TrendingUp,
  Award,
  PlayCircle
} from 'lucide-react';
import videoHusky13 from '../../assets/videos/video-husky13.mp4';
import styles from './Movies.module.css';

export const Movies: React.FC = () => {
  // Sample movie data - in a real app, this would come from an API
  const movies = [
    {
      id: 1,
      title: "The Shawshank Redemption",
      description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      level: "Intermediate",
      duration: "2h 22m",
      genres: ["Drama", "Crime"]
    },
    {
      id: 2,
      title: "Forrest Gump",
      description: "The presidencies of Kennedy and Johnson, Vietnam, Watergate, and other history unfold through the perspective of an Alabama man with an IQ of 75.",
      level: "Beginner",
      duration: "2h 22m",
      genres: ["Drama", "Romance"]
    },
    {
      id: 3,
      title: "The Godfather",
      description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      level: "Advanced",
      duration: "2h 55m",
      genres: ["Crime", "Drama"]
    }
  ];

  return (
    <div className={`${styles.pageContent} page-entrance`}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Movies & TV</h1>
          <p className={styles.subtitle}>Improve your English by watching your favorite movies and shows</p>
        </div>
        <div className={styles.huskyContainer}>
          <video
            src={videoHusky13}
            autoPlay
            loop
            muted
            playsInline
            className={styles.huskyVideo}
          />
        </div>
      </header>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--gradient-primary)' }}>
            <Film size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statNumber}>{movies.length}</span>
            <span className={styles.statLabel}>Recommended</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--gradient-secondary)' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statNumber}>3</span>
            <span className={styles.statLabel}>Levels</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--gradient-success)' }}>
            <Award size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statNumber}>8</span>
            <span className={styles.statLabel}>Genres</span>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search movies..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.selectWrapper}>
            <Filter size={16} className={styles.selectIcon} />
            <select className={styles.filterSelect}>
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <Clapperboard size={16} className={styles.selectIcon} />
            <select className={styles.filterSelect}>
              <option value="">All Genres</option>
              <option value="drama">Drama</option>
              <option value="comedy">Comedy</option>
              <option value="action">Action</option>
              <option value="crime">Crime</option>
            </select>
          </div>

          <button className={styles.primaryButton}>
            <Plus size={18} />
            <span>Add Movie</span>
          </button>
        </div>
      </div>

      <div className={styles.moviesGrid}>
        {movies.map((movie) => (
          <div key={movie.id} className={styles.movieCard}>
            <div className={styles.movieImage}>
              <Video size={48} className={styles.movieIcon} />
              <div className={styles.movieOverlay}>
                <button className={styles.playButton}>
                  <PlayCircle size={48} fill="currentColor" />
                </button>
              </div>
            </div>

            <div className={styles.movieContent}>
              <div className={styles.movieHeader}>
                <h3 className={styles.movieTitle}>{movie.title}</h3>
                <button className={styles.favoriteButton} title="Add to favorites">
                  <Heart size={18} />
                </button>
              </div>

              <p className={styles.movieDescription}>{movie.description}</p>

              <div className={styles.movieMeta}>
                <span className={`${styles.level} ${styles[movie.level.toLowerCase()]}`}>
                  {movie.level}
                </span>
                <span className={styles.duration}>
                  <Clock size={14} />
                  {movie.duration}
                </span>
              </div>

              <div className={styles.genres}>
                {movie.genres.map((genre, index) => (
                  <span key={index} className={styles.genre}>
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.movieActions}>
              <button className={`${styles.favoriteAction}`}>
                <Heart size={18} />
              </button>
              <div className={styles.mainActions}>
                <button className={styles.actionBtn}>
                  Ver Ahora
                </button>
                <button className={styles.actionBtn}>
                  Editar
                </button>
                <button className={`${styles.actionBtn} ${styles.deleteBtn}`}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {movies.length === 0 && (
        <div className={styles.emptyState}>
          <Video size={48} className={styles.emptyIcon} />
          <p>No movies available yet</p>
          <button className={styles.primaryButton}>
            Add your first movie
          </button>
        </div>
      )}
    </div>
  );
};

export default Movies;