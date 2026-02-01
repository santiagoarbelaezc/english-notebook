import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import styles from './Songs.module.css';
import { getAllSongs, toggleSongFavorite, getSongStats, createSong, updateSong, uploadCoverImage } from '../../api';
import type { CreateSongRequest } from '../../types';

// Function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

interface Song {
  _id: string;
  title: string;
  artist: string;
  coverImage?: string;
  lyrics: string;
  topic: 'love' | 'motivation' | 'adventure' | 'daily-life' | 'nature' | 'friendship' | 'other';
  isFavorite: boolean;
  createdAt: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  notes?: string;
  translation?: string;
  annotatedVocabulary?: Array<{
    word: string;
    meaning: string;
    line?: number;
  }>;
  keyPhrases?: Array<{
    phrase: string;
    meaning: string;
    explanation?: string;
  }>;
}

const Songs: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSongs: 0, favoriteSongs: 0 });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateSongRequest>({
    title: '',
    artist: '',
    lyrics: '',
    topic: 'other',
    youtubeUrl: '',
    spotifyUrl: '',
    notes: '',
    translation: '',
    annotatedVocabulary: [],
    keyPhrases: []
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  // Fetch songs from API
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await getAllSongs();
        setSongs(response.songs);
        setFilteredSongs(response.songs);
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await getSongStats();
        setStats({
          totalSongs: response.stats.totalSongs,
          favoriteSongs: response.stats.favoriteSongs,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchSongs();
    fetchStats();
  }, []);

  // Filter songs based on search and filters
  useEffect(() => {
    let filtered = songs;

    if (searchTerm) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTopic !== 'all') {
      filtered = filtered.filter(song => song.topic === selectedTopic);
    }

    setFilteredSongs(filtered);
  }, [songs, searchTerm, selectedTopic]);

  const toggleFavorite = async (songId: string) => {
    try {
      const response = await toggleSongFavorite(songId);
      setSongs(prevSongs =>
        prevSongs.map(song =>
          song._id === songId ? { ...song, isFavorite: response.song.isFavorite } : song
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
    setShowViewModal(true);
  };

  const handleEditSong = (song: Song) => {
    setSelectedSong(song);
    // Load song data into form
    setFormData({
      title: song.title,
      artist: song.artist,
      lyrics: song.lyrics,
      topic: song.topic,
      youtubeUrl: song.youtubeUrl || '',
      spotifyUrl: song.spotifyUrl || '',
      notes: song.notes || '',
      translation: song.translation || '',
      annotatedVocabulary: song.annotatedVocabulary || [],
      keyPhrases: song.keyPhrases || []
    });
    setShowEditModal(true);
  };

  const getTopicColor = (topic: string) => {
    switch (topic) {
      case 'love': return styles['topic.love'];
      case 'motivation': return styles['topic.motivation'];
      case 'adventure': return styles['topic.adventure'];
      case 'daily-life': return styles['topic.daily-life'];
      case 'nature': return styles['topic.nature'];
      case 'friendship': return styles['topic.friendship'];
      case 'other': return styles['topic.other'];
      default: return styles['topic.other'];
    }
  };

  const getAllTopics = () => {
    const topics = new Set<string>();
    songs.forEach(song => topics.add(song.topic));
    return Array.from(topics).sort();
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      artist: '',
      lyrics: '',
      topic: 'other',
      youtubeUrl: '',
      spotifyUrl: '',
      notes: '',
      translation: '',
      annotatedVocabulary: [],
      keyPhrases: []
    });
    setCoverImageFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverImageFile(file);
  };

  // Vocabulary management
  const addVocabularyItem = () => {
    setFormData(prev => ({
      ...prev,
      annotatedVocabulary: [
        ...(prev.annotatedVocabulary || []),
        { word: '', meaning: '', line: undefined }
      ]
    }));
  };

  const updateVocabularyItem = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      annotatedVocabulary: (prev.annotatedVocabulary || []).map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeVocabularyItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      annotatedVocabulary: (prev.annotatedVocabulary || []).filter((_, i) => i !== index)
    }));
  };

  // Key phrases management
  const addKeyPhrase = () => {
    setFormData(prev => ({
      ...prev,
      keyPhrases: [
        ...(prev.keyPhrases || []),
        { phrase: '', meaning: '', explanation: '' }
      ]
    }));
  };

  const updateKeyPhrase = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyPhrases: (prev.keyPhrases || []).map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeKeyPhrase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyPhrases: (prev.keyPhrases || []).filter((_, i) => i !== index)
    }));
  };

  const handleCreateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.artist.trim() || !formData.lyrics.trim()) {
      alert('Title, artist, and lyrics are required');
      return;
    }

    setCreating(true);
    try {
      // Create the song first
      const response = await createSong(formData);
      let updatedSong = response.song;

      // If there's a cover image file, upload it
      if (coverImageFile) {
        try {
          const uploadResponse = await uploadCoverImage(response.song._id, coverImageFile);
          updatedSong = { ...updatedSong, coverImage: uploadResponse.coverImage.url };
        } catch (uploadError) {
          console.error('Error uploading cover image:', uploadError);
          // Don't fail the whole operation if image upload fails
          alert('Song created successfully, but cover image upload failed. You can upload it later.');
        }
      }

      setSongs(prev => [updatedSong, ...prev]);
      setShowCreateModal(false);
      resetForm();
      
      // Refresh stats
      const statsResponse = await getSongStats();
      setStats({
        totalSongs: statsResponse.stats.totalSongs,
        favoriteSongs: statsResponse.stats.favoriteSongs,
      });
    } catch (error) {
      console.error('Error creating song:', error);
      alert('Error creating song. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSong || !formData.title.trim() || !formData.artist.trim() || !formData.lyrics.trim()) {
      alert('Title, artist, and lyrics are required');
      return;
    }

    setEditing(true);
    try {
      // Update the song
      const response = await updateSong(selectedSong._id, formData);
      let updatedSong = response.song;

      // If there's a cover image file, upload it
      if (coverImageFile) {
        try {
          const uploadResponse = await uploadCoverImage(selectedSong._id, coverImageFile);
          updatedSong = { ...updatedSong, coverImage: uploadResponse.coverImage.url };
        } catch (uploadError) {
          console.error('Error uploading cover image:', uploadError);
          // Don't fail the whole operation if image upload fails
          alert('Song updated successfully, but cover image upload failed. You can upload it later.');
        }
      }

      // Update the song in the local state
      setSongs(prev => prev.map(song =>
        song._id === selectedSong._id ? updatedSong : song
      ));

      setShowEditModal(false);
      setSelectedSong(null);
      resetForm();
    } catch (error) {
      console.error('Error updating song:', error);
      alert('Error updating song. Please try again.');
    } finally {
      setEditing(false);
    }
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
        <button
          className={styles.addButton}
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Add New Song
        </button>
      </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.totalSongs}</span>
            <span className={styles.statLabel}>Total Songs</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.favoriteSongs}</span>
            <span className={styles.statLabel}>Favorites</span>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search songs or artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filters}>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Topics</option>
              {getAllTopics().map(topic => (
                <option key={topic} value={topic}>{topic}</option>
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
              <div key={song._id} className={styles.songCard} onClick={() => handleSongClick(song)}>
                <div className={styles.songImage}>
                  {song.coverImage ? (
                    <img src={song.coverImage} alt={song.title} className={styles.coverImage} />
                  ) : (
                    <span className={styles.songIcon}>🎵</span>
                  )}
                </div>
                <div className={styles.songContent}>
                  <h3 className={styles.songTitle}>{song.title}</h3>
                  <p className={styles.songArtist}>{song.artist}</p>
                  <div className={styles.songMeta}>
                    <span className={`${styles.topic} ${getTopicColor(song.topic)}`}>
                      {song.topic}
                    </span>
                  </div>
                </div>
                <div className={styles.songActions} onClick={(e) => e.stopPropagation()}>
                  <button 
                    className={`${styles.songAction} ${styles.play}`}
                    onClick={() => song.youtubeUrl && window.open(song.youtubeUrl, '_blank')}
                  >
                    <span>▶️</span>
                    <span>Play</span>
                  </button>
                  <button
                    className={`${styles.songAction} ${styles.favorite}`}
                    onClick={() => toggleFavorite(song._id)}
                  >
                    <span>{song.isFavorite ? '❤️' : '🤍'}</span>
                    <span>{song.isFavorite ? 'Favorited' : 'Favorite'}</span>
                  </button>
                  <button
                    className={`${styles.songAction} ${styles.edit}`}
                    onClick={() => handleEditSong(song)}
                  >
                    <span>✏️</span>
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Song View Modal */}
      {showViewModal && selectedSong && (
        <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.songHeader}>
                <div className={styles.songCover}>
                  {selectedSong.coverImage ? (
                    <img src={selectedSong.coverImage} alt={selectedSong.title} className={styles.modalCoverImage} />
                  ) : (
                    <div className={styles.modalSongIcon}>🎵</div>
                  )}
                </div>
                <div className={styles.songInfo}>
                  <h2 className={styles.modalTitle}>{selectedSong.title}</h2>
                  <p className={styles.modalArtist}>{selectedSong.artist}</p>
                  <div className={styles.songMeta}>
                    <span className={`${styles.topic} ${getTopicColor(selectedSong.topic)}`}>
                      {selectedSong.topic}
                    </span>
                    {selectedSong.isFavorite && <span className={styles.favoriteBadge}>❤️ Favorite</span>}
                  </div>
                </div>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => setShowViewModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.songViewContent}>
              {/* URLs Section */}
              {(selectedSong.youtubeUrl || selectedSong.spotifyUrl) && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Listen On</h3>
                  <div className={styles.urlButtons}>
                    {selectedSong.youtubeUrl && (
                      <a
                        href={selectedSong.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.urlButton}
                      >
                        <span>▶️</span> YouTube
                      </a>
                    )}
                    {selectedSong.spotifyUrl && (
                      <a
                        href={selectedSong.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.urlButton}
                      >
                        <span>🎵</span> Spotify
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* YouTube Player Section */}
              {selectedSong.youtubeUrl && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Play Song</h3>
                  <div className={styles.youtubePlayer}>
                    <YouTube
                      videoId={getYouTubeVideoId(selectedSong.youtubeUrl) || ''}
                      opts={{
                        height: '200',
                        width: '100%',
                        playerVars: {
                          autoplay: 0,
                          controls: 1,
                          modestbranding: 1,
                        },
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Lyrics Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Lyrics</h3>
                <div className={styles.lyricsContainer}>
                  <pre className={styles.lyrics}>{selectedSong.lyrics}</pre>
                </div>
              </div>

              {/* Translation Section */}
              {selectedSong.translation && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Translation</h3>
                  <div className={styles.translationContainer}>
                    <pre className={styles.translation}>{selectedSong.translation}</pre>
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {selectedSong.notes && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Notes</h3>
                  <div className={styles.notesContainer}>
                    <p className={styles.notes}>{selectedSong.notes}</p>
                  </div>
                </div>
              )}

              {/* Annotated Vocabulary Section */}
              {selectedSong.annotatedVocabulary && selectedSong.annotatedVocabulary.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Vocabulary</h3>
                  <div className={styles.vocabularyList}>
                    {selectedSong.annotatedVocabulary.map((vocab, index) => (
                      <div key={index} className={styles.vocabularyItem}>
                        <div className={styles.vocabularyWord}>
                          <strong>{vocab.word}</strong>
                          {vocab.line && <span className={styles.lineNumber}>(Line {vocab.line})</span>}
                        </div>
                        <div className={styles.vocabularyMeaning}>{vocab.meaning}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Phrases Section */}
              {selectedSong.keyPhrases && selectedSong.keyPhrases.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Key Phrases</h3>
                  <div className={styles.phrasesList}>
                    {selectedSong.keyPhrases.map((phrase, index) => (
                      <div key={index} className={styles.phraseItem}>
                        <div className={styles.phraseText}>
                          <strong>"{phrase.phrase}"</strong>
                        </div>
                        <div className={styles.phraseMeaning}>{phrase.meaning}</div>
                        {phrase.explanation && (
                          <div className={styles.phraseExplanation}>{phrase.explanation}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                className={`${styles.songAction} ${styles.favorite}`}
                onClick={() => {
                  toggleFavorite(selectedSong._id);
                  setSelectedSong(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
                }}
              >
                <span>{selectedSong.isFavorite ? '❤️' : '🤍'}</span>
                <span>{selectedSong.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
              </button>
              <button
                className={`${styles.songAction} ${styles.edit}`}
                onClick={() => {
                  setShowViewModal(false);
                  handleEditSong(selectedSong);
                }}
              >
                <span>✏️</span>
                <span>Edit Song</span>
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Song Modal */}
      {showEditModal && selectedSong && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Song</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSong} className={styles.songForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-title" className={styles.formLabel}>Title *</label>
                  <input
                    type="text"
                    id="edit-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-artist" className={styles.formLabel}>Artist *</label>
                  <input
                    type="text"
                    id="edit-artist"
                    name="artist"
                    value={formData.artist}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-topic" className={styles.formLabel}>Topic</label>
                <select
                  id="edit-topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="love">Love</option>
                  <option value="motivation">Motivation</option>
                  <option value="adventure">Adventure</option>
                  <option value="daily-life">Daily Life</option>
                  <option value="nature">Nature</option>
                  <option value="friendship">Friendship</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-coverImage" className={styles.formLabel}>Cover Image</label>
                <input
                  type="file"
                  id="edit-coverImage"
                  name="coverImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.formFileInput}
                />
                {coverImageFile && (
                  <div className={styles.filePreview}>
                    <span>Selected: {coverImageFile.name}</span>
                  </div>
                )}
                {selectedSong.coverImage && !coverImageFile && (
                  <div className={styles.filePreview}>
                    <span>Current: {selectedSong.coverImage.split('/').pop()}</span>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-lyrics" className={styles.formLabel}>Lyrics *</label>
                <textarea
                  id="edit-lyrics"
                  name="lyrics"
                  value={formData.lyrics}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  rows={6}
                  placeholder="Enter the song lyrics here..."
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-youtubeUrl" className={styles.formLabel}>YouTube URL</label>
                  <input
                    type="url"
                    id="edit-youtubeUrl"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-spotifyUrl" className={styles.formLabel}>Spotify URL</label>
                  <input
                    type="url"
                    id="edit-spotifyUrl"
                    name="spotifyUrl"
                    value={formData.spotifyUrl}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="https://spotify.com/..."
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-notes" className={styles.formLabel}>Notes</label>
                <textarea
                  id="edit-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  rows={3}
                  placeholder="Additional notes about the song..."
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-translation" className={styles.formLabel}>Translation</label>
                <textarea
                  id="edit-translation"
                  name="translation"
                  value={formData.translation}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  rows={4}
                  placeholder="Translation of the lyrics..."
                />
              </div>

              {/* Annotated Vocabulary Section */}
              <div className={styles.formGroup}>
                <div className={styles.sectionHeader}>
                  <label className={styles.formLabel}>Annotated Vocabulary</label>
                  <button
                    type="button"
                    onClick={addVocabularyItem}
                    className={styles.addItemButton}
                  >
                    ➕ Add Word
                  </button>
                </div>
                {(formData.annotatedVocabulary || []).map((vocab, index) => (
                  <div key={index} className={styles.itemRow}>
                    <div className={styles.itemFields}>
                      <input
                        type="text"
                        placeholder="Word"
                        value={vocab.word}
                        onChange={(e) => updateVocabularyItem(index, 'word', e.target.value)}
                        className={styles.formInput}
                      />
                      <input
                        type="text"
                        placeholder="Meaning"
                        value={vocab.meaning}
                        onChange={(e) => updateVocabularyItem(index, 'meaning', e.target.value)}
                        className={styles.formInput}
                      />
                      <input
                        type="number"
                        placeholder="Line #"
                        value={vocab.line || ''}
                        onChange={(e) => updateVocabularyItem(index, 'line', e.target.value ? parseInt(e.target.value) : 0)}
                        className={styles.formInput}
                        min="1"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVocabularyItem(index)}
                      className={styles.removeItemButton}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Key Phrases Section */}
              <div className={styles.formGroup}>
                <div className={styles.sectionHeader}>
                  <label className={styles.formLabel}>Key Phrases</label>
                  <button
                    type="button"
                    onClick={addKeyPhrase}
                    className={styles.addItemButton}
                  >
                    ➕ Add Phrase
                  </button>
                </div>
                {(formData.keyPhrases || []).map((phrase, index) => (
                  <div key={index} className={styles.itemRow}>
                    <div className={styles.itemFields}>
                      <input
                        type="text"
                        placeholder="Phrase"
                        value={phrase.phrase}
                        onChange={(e) => updateKeyPhrase(index, 'phrase', e.target.value)}
                        className={styles.formInput}
                      />
                      <input
                        type="text"
                        placeholder="Meaning"
                        value={phrase.meaning}
                        onChange={(e) => updateKeyPhrase(index, 'meaning', e.target.value)}
                        className={styles.formInput}
                      />
                      <input
                        type="text"
                        placeholder="Explanation (optional)"
                        value={phrase.explanation || ''}
                        onChange={(e) => updateKeyPhrase(index, 'explanation', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeKeyPhrase(index)}
                      className={styles.removeItemButton}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSong(null);
                    resetForm();
                  }}
                  disabled={editing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={editing}
                >
                  {editing ? 'Updating...' : 'Update Song'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Song Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add New Song</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSong} className={styles.songForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="title" className={styles.formLabel}>Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="artist" className={styles.formLabel}>Artist *</label>
                  <input
                    type="text"
                    id="artist"
                    name="artist"
                    value={formData.artist}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="topic" className={styles.formLabel}>Topic</label>
                <select
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="love">Love</option>
                  <option value="motivation">Motivation</option>
                  <option value="adventure">Adventure</option>
                  <option value="daily-life">Daily Life</option>
                  <option value="nature">Nature</option>
                  <option value="friendship">Friendship</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="coverImage" className={styles.formLabel}>Cover Image</label>
                <input
                  type="file"
                  id="coverImage"
                  name="coverImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.formFileInput}
                />
                {coverImageFile && (
                  <div className={styles.filePreview}>
                    <span>Selected: {coverImageFile.name}</span>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lyrics" className={styles.formLabel}>Lyrics *</label>
                <textarea
                  id="lyrics"
                  name="lyrics"
                  value={formData.lyrics}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  rows={6}
                  placeholder="Enter the song lyrics here..."
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="youtubeUrl" className={styles.formLabel}>YouTube URL</label>
                  <input
                    type="url"
                    id="youtubeUrl"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="spotifyUrl" className={styles.formLabel}>Spotify URL</label>
                  <input
                    type="url"
                    id="spotifyUrl"
                    name="spotifyUrl"
                    value={formData.spotifyUrl}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="https://spotify.com/..."
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="notes" className={styles.formLabel}>Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  rows={3}
                  placeholder="Additional notes about the song..."
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="translation" className={styles.formLabel}>Translation</label>
                <textarea
                  id="translation"
                  name="translation"
                  value={formData.translation}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  rows={4}
                  placeholder="Translation of the lyrics..."
                />
              </div>

              {/* Annotated Vocabulary Section */}
              <div className={styles.formGroup}>
                <div className={styles.sectionHeader}>
                  <label className={styles.formLabel}>Annotated Vocabulary</label>
                  <button
                    type="button"
                    onClick={addVocabularyItem}
                    className={styles.addItemButton}
                  >
                    ➕ Add Word
                  </button>
                </div>
                {(formData.annotatedVocabulary || []).map((vocab, index) => (
                  <div key={index} className={styles.itemRow}>
                    <div className={styles.itemFields}>
                      <input
                        type="text"
                        placeholder="Word"
                        value={vocab.word}
                        onChange={(e) => updateVocabularyItem(index, 'word', e.target.value)}
                        className={styles.formInput}
                      />
                      <input
                        type="text"
                        placeholder="Meaning"
                        value={vocab.meaning}
                        onChange={(e) => updateVocabularyItem(index, 'meaning', e.target.value)}
                        className={styles.formInput}
                      />
                      <input
                        type="number"
                        placeholder="Line #"
                        value={vocab.line || ''}
                        onChange={(e) => updateVocabularyItem(index, 'line', e.target.value ? parseInt(e.target.value) : 0)}
                        className={styles.formInput}
                        min="1"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVocabularyItem(index)}
                      className={styles.removeItemButton}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Key Phrases Section */}
              <div className={styles.formGroup}>
                <div className={styles.sectionHeader}>
                  <label className={styles.formLabel}>Key Phrases</label>
                  <button
                    type="button"
                    onClick={addKeyPhrase}
                    className={styles.addItemButton}
                  >
                    ➕ Add Phrase
                  </button>
                </div>
                {(formData.keyPhrases || []).map((phrase, index) => (
                  <div key={index} className={styles.itemRow}>
                    <div className={styles.itemFields}>
                      <input
                        type="text"
                        placeholder="Phrase"
                        value={phrase.phrase}
                        onChange={(e) => updateKeyPhrase(index, 'phrase', e.target.value)}
                        className={styles.formInput}
                      />
                      <input
                        type="text"
                        placeholder="Meaning"
                        value={phrase.meaning}
                        onChange={(e) => updateKeyPhrase(index, 'meaning', e.target.value)}
                        className={styles.formInput}
                      />
                      <input
                        type="text"
                        placeholder="Explanation (optional)"
                        value={phrase.explanation || ''}
                        onChange={(e) => updateKeyPhrase(index, 'explanation', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeKeyPhrase(index)}
                      className={styles.removeItemButton}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Song'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Songs;