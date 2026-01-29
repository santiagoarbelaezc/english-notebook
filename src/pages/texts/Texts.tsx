import React, { useState, useEffect } from 'react';
import styles from './Texts.module.css';

interface Text {
  id: string;
  title: string;
  author: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  wordCount: number;
  readTime: string;
  excerpt: string;
  content?: string;
  isRead: boolean;
  isFavorite: boolean;
}

const Texts: React.FC = () => {
  const [texts, setTexts] = useState<Text[]>([]);
  const [filteredTexts, setFilteredTexts] = useState<Text[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const mockTexts: Text[] = [
      {
        id: '1',
        title: 'The Little Prince',
        author: 'Antoine de Saint-Exupéry',
        category: 'Literature',
        level: 'intermediate',
        wordCount: 15000,
        readTime: '45 min',
        excerpt: 'Once when I was six years old I saw a magnificent picture in a book...',
        isRead: false,
        isFavorite: true,
      },
      {
        id: '2',
        title: '1984',
        author: 'George Orwell',
        category: 'Dystopian',
        level: 'advanced',
        wordCount: 89000,
        readTime: '6 hours',
        excerpt: 'It was a bright cold day in April, and the clocks were striking thirteen...',
        isRead: true,
        isFavorite: false,
      },
      {
        id: '3',
        title: 'Harry Potter and the Philosopher\'s Stone',
        author: 'J.K. Rowling',
        category: 'Fantasy',
        level: 'intermediate',
        wordCount: 77000,
        readTime: '4 hours',
        excerpt: 'Mr. and Mrs. Dursley, of number four, Privet Drive, were proud to say...',
        isRead: false,
        isFavorite: true,
      },
      {
        id: '4',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'Classic',
        level: 'advanced',
        wordCount: 47000,
        readTime: '3 hours',
        excerpt: 'In my younger and more vulnerable years my father gave me some advice...',
        isRead: true,
        isFavorite: false,
      },
      {
        id: '5',
        title: 'Alice\'s Adventures in Wonderland',
        author: 'Lewis Carroll',
        category: 'Fantasy',
        level: 'beginner',
        wordCount: 27000,
        readTime: '2 hours',
        excerpt: 'Alice was beginning to get very tired of sitting by her sister...',
        isRead: false,
        isFavorite: false,
      },
      {
        id: '6',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        category: 'Romance',
        level: 'advanced',
        wordCount: 122000,
        readTime: '8 hours',
        excerpt: 'It is a truth universally acknowledged, that a single man in possession...',
        isRead: true,
        isFavorite: true,
      },
    ];

    setTimeout(() => {
      setTexts(mockTexts);
      setFilteredTexts(mockTexts);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter texts based on search and filters
  useEffect(() => {
    let filtered = texts;

    if (searchTerm) {
      filtered = filtered.filter(text =>
        text.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        text.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        text.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(text => text.level === selectedLevel);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(text => text.category === selectedCategory);
    }

    setFilteredTexts(filtered);
  }, [texts, searchTerm, selectedLevel, selectedCategory]);

  const toggleFavorite = (textId: string) => {
    setTexts(prevTexts =>
      prevTexts.map(text =>
        text.id === textId ? { ...text, isFavorite: !text.isFavorite } : text
      )
    );
  };

  const markAsRead = (textId: string) => {
    setTexts(prevTexts =>
      prevTexts.map(text =>
        text.id === textId ? { ...text, isRead: true } : text
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

  const getAllCategories = () => {
    const categories = new Set<string>();
    texts.forEach(text => categories.add(text.category));
    return Array.from(categories).sort();
  };

  if (loading) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.loading}>Loading texts...</div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.header}>
        <h1 className={styles.title}>📖 Texts</h1>
        <p className={styles.subtitle}>
          Improve your reading comprehension with curated texts for different levels
        </p>
      </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{texts.length}</span>
            <span className={styles.statLabel}>Total Texts</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {texts.filter(t => t.isRead).length}
            </span>
            <span className={styles.statLabel}>Read</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {texts.filter(t => t.isFavorite).length}
            </span>
            <span className={styles.statLabel}>Favorites</span>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search texts, authors, or categories..."
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Categories</option>
              {getAllCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredTexts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No texts found matching your criteria.</p>
          </div>
        ) : (
          <div className={styles.textsGrid}>
            {filteredTexts.map(text => (
              <div key={text.id} className={styles.textCard}>
                <div className={styles.textImage}>
                  <span className={styles.textIcon}>📖</span>
                </div>
                <div className={styles.textContent}>
                  <h3 className={styles.textTitle}>{text.title}</h3>
                  <p className={styles.textAuthor}>by {text.author}</p>
                  <div className={styles.textMeta}>
                    <span className={`${styles.level} ${getLevelColor(text.level)}`}>
                      {text.level}
                    </span>
                    <span className={styles.category}>{text.category}</span>
                    <span className={styles.readTime}>{text.readTime}</span>
                  </div>
                  <p className={styles.excerpt}>{text.excerpt}</p>
                  <div className={styles.textStats}>
                    <span className={styles.wordCount}>{text.wordCount.toLocaleString()} words</span>
                    {text.isRead && <span className={styles.readBadge}>✓ Read</span>}
                  </div>
                </div>
                <div className={styles.textActions}>
                  <button
                    className={styles.readButton}
                    onClick={() => markAsRead(text.id)}
                    disabled={text.isRead}
                  >
                    {text.isRead ? '✓ Read' : '📖 Read'}
                  </button>
                  <button
                    className={styles.favoriteButton}
                    onClick={() => toggleFavorite(text.id)}
                  >
                    {text.isFavorite ? '❤️' : '🤍'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default Texts;