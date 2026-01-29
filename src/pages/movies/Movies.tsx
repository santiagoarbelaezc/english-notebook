import React from 'react';
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
      genres: ["Drama", "Crime"],
      image: "🎥"
    },
    {
      id: 2,
      title: "Forrest Gump",
      description: "The presidencies of Kennedy and Johnson, Vietnam, Watergate, and other history unfold through the perspective of an Alabama man with an IQ of 75.",
      level: "Beginner",
      duration: "2h 22m",
      genres: ["Drama", "Romance"],
      image: "🎬"
    },
    {
      id: 3,
      title: "The Godfather",
      description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      level: "Advanced",
      duration: "2h 55m",
      genres: ["Crime", "Drama"],
      image: "🎭"
    }
  ];

  return (
    <div className={styles.pageContent}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎬 Movies</h1>
        <p className={styles.subtitle}>Improve your English by watching movies</p>
      </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{movies.length}</span>
            <span className={styles.statLabel}>Recommended Movies</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>3</span>
            <span className={styles.statLabel}>Difficulty Levels</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>8</span>
            <span className={styles.statLabel}>Genres</span>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search movies..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <select className={styles.filterSelect}>
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select className={styles.filterSelect}>
              <option value="">All Genres</option>
              <option value="drama">Drama</option>
              <option value="comedy">Comedy</option>
              <option value="action">Action</option>
              <option value="crime">Crime</option>
            </select>

            <button className={styles.primaryButton}>
              + Add Movie
            </button>
          </div>
        </div>

        <div className={styles.moviesGrid}>
          {movies.map((movie) => (
            <div key={movie.id} className={styles.movieCard}>
              <div className={styles.movieImage}>
                <span className={styles.movieIcon}>{movie.image}</span>
              </div>

              <div className={styles.movieContent}>
                <h3 className={styles.movieTitle}>{movie.title}</h3>
                <p className={styles.movieDescription}>{movie.description}</p>

                <div className={styles.movieMeta}>
                  <span className={`${styles.level} ${styles[movie.level.toLowerCase()]}`}>
                    {movie.level}
                  </span>
                  <span className={styles.duration}>{movie.duration}</span>
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
                <button className={styles.watchButton}>
                  ▶ Watch
                </button>
                <button className={styles.favoriteButton} title="Add to favorites">
                  ♥
                </button>
              </div>
            </div>
          ))}
        </div>

        {movies.length === 0 && (
          <div className={styles.emptyState}>
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