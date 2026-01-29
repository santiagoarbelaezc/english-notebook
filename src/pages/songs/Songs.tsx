import React, { useState, useEffect } from 'react';
import styles from './Songs.module.css';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  genres: string[];
  lyrics?: string;
  audioUrl?: string;
  isFavorite: boolean;
}

const Songs: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const mockSongs: Song[] = [
      {
        id: '1',
        title: 'Yesterday',
        artist: 'The Beatles',
        album: 'Help!',
        duration: '2:05',
        level: 'beginner',
        genres: ['Rock', 'Pop'],
        lyrics: 'Yesterday, all my troubles seemed so far away...',
        isFavorite: false,
      },
      {
        id: '2',
        title: 'Imagine',
        artist: 'John Lennon',
        album: 'Imagine',
        duration: '3:03',
        level: 'intermediate',
        genres: ['Rock', 'Peace'],
        lyrics: 'You may say I\'m a dreamer...',
        isFavorite: true,
      },
      {
        id: '3',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        album: 'A Night at the Opera',
        duration: '5:55',
        level: 'advanced',
        genres: ['Rock', 'Opera'],
        lyrics: 'Is this the real life? Is this just fantasy?',
        isFavorite: false,
      },
      {
        id: '4',
        title: 'Hotel California',
        artist: 'Eagles',
        album: 'Hotel California',
        duration: '6:30',
        level: 'intermediate',
        genres: ['Rock', 'Classic Rock'],
        lyrics: 'On a dark desert highway, cool wind in my hair...',
        isFavorite: false,
      },
      {
        id: '5',
        title: 'Hey Jude',
        artist: 'The Beatles',
        album: 'Hey Jude',
        duration: '7:11',
        level: 'intermediate',
        genres: ['Rock', 'Ballad'],
        lyrics: 'Hey Jude, don\'t make it bad...',
        isFavorite: true,
      },
      {
        id: '6',
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        album: 'Led Zeppelin IV',
        duration: '8:02',
        level: 'advanced',
        genres: ['Rock', 'Hard Rock'],
        lyrics: 'There\'s a lady who\'s sure all that glitters is gold...',
        isFavorite: false,
      },
    ];

    setTimeout(() => {
      setSongs(mockSongs);
      setFilteredSongs(mockSongs);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter songs based on search and filters
  useEffect(() => {
    let filtered = songs;

    if (searchTerm) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.album?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(song => song.level === selectedLevel);
    }

    if (selectedGenre !== 'all') {
      filtered = filtered.filter(song => song.genres.includes(selectedGenre));
    }

    setFilteredSongs(filtered);
  }, [songs, searchTerm, selectedLevel, selectedGenre]);

  const toggleFavorite = (songId: string) => {
    setSongs(prevSongs =>
      prevSongs.map(song =>
        song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song
      )
    );
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return styles['level.beginner'];
      case 'intermediate': return styles['level.intermediate'];
      case 'advanced': return styles['level.advanced'];
      default: return styles['level.beginner'];
    }
  };

  const getAllGenres = () => {
    const genres = new Set<string>();
    songs.forEach(song => song.genres.forEach(genre => genres.add(genre)));
    return Array.from(genres).sort();
  };

  if (loading) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.loading}>Loading songs...</div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎵 Songs</h1>
        <p className={styles.subtitle}>
          Improve your English listening skills with curated songs for different levels
        </p>
      </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{songs.length}</span>
            <span className={styles.statLabel}>Total Songs</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {songs.filter(s => s.isFavorite).length}
            </span>
            <span className={styles.statLabel}>Favorites</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {songs.filter(s => s.level === 'beginner').length}
            </span>
            <span className={styles.statLabel}>Beginner Songs</span>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search songs, artists, or albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filters}>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Genres</option>
              {getAllGenres().map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredSongs.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No songs found matching your criteria.</p>
          </div>
        ) : (
          <div className={styles.songsGrid}>
            {filteredSongs.map(song => (
              <div key={song.id} className={styles.songCard}>
                <div className={styles.songImage}>
                  <span className={styles.songIcon}>🎵</span>
                </div>
                <div className={styles.songContent}>
                  <h3 className={styles.songTitle}>{song.title}</h3>
                  <p className={styles.songArtist}>{song.artist}</p>
                  {song.album && (
                    <p className={styles.songAlbum}>{song.album}</p>
                  )}
                  <div className={styles.songMeta}>
                    <span className={`${styles.level} ${getLevelColor(song.level)}`}>
                      {song.level}
                    </span>
                    <span className={styles.duration}>{song.duration}</span>
                  </div>
                  <div className={styles.genres}>
                    {song.genres.map(genre => (
                      <span key={genre} className={styles.genre}>{genre}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.songActions}>
                  <button className={styles.playButton}>
                    ▶️ Play
                  </button>
                  <button
                    className={styles.favoriteButton}
                    onClick={() => toggleFavorite(song.id)}
                  >
                    {song.isFavorite ? '❤️' : '🤍'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default Songs;