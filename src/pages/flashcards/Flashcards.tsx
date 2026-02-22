import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Heart,
  Files,
  BookOpen,
  Shield,
  Star,
  Flame,
  Award,
  ChevronRight,
  Clock,
  Layers
} from 'lucide-react';
import styles from './Flashcards.module.css';
import huskyIcon from '../../assets/icons/husky.png';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  isFavorite: boolean;
  createdAt: string;
}

const Flashcards: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  // Mock data - replace with API call
  useEffect(() => {
    const mockFlashcards: Flashcard[] = [
      {
        id: '1',
        front: 'Hello',
        back: 'Hola',
        difficulty: 'easy',
        category: 'Greetings',
        isFavorite: true,
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        front: 'Thank you',
        back: 'Gracias',
        difficulty: 'easy',
        category: 'Politeness',
        isFavorite: false,
        createdAt: '2024-01-16',
      },
      {
        id: '3',
        front: 'How are you?',
        back: '¿Cómo estás?',
        difficulty: 'medium',
        category: 'Questions',
        isFavorite: true,
        createdAt: '2024-01-17',
      },
      {
        id: '4',
        front: 'I am learning English',
        back: 'Estoy aprendiendo inglés',
        difficulty: 'medium',
        category: 'Self Introduction',
        isFavorite: false,
        createdAt: '2024-01-18',
      },
      {
        id: '5',
        front: 'Beautiful',
        back: 'Hermoso/a',
        difficulty: 'easy',
        category: 'Adjectives',
        isFavorite: false,
        createdAt: '2024-01-19',
      },
      {
        id: '6',
        front: 'To communicate effectively',
        back: 'Comunicarse efectivamente',
        difficulty: 'hard',
        category: 'Advanced',
        isFavorite: true,
        createdAt: '2024-01-20',
      },
    ];

    setTimeout(() => {
      setFlashcards(mockFlashcards);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter flashcards based on search and filters
  const filteredFlashcards = React.useMemo(() => {
    let filtered = flashcards;

    if (searchTerm) {
      filtered = filtered.filter(card =>
        card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.back.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(card => card.difficulty === difficultyFilter);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(card => card.isFavorite);
    }

    return filtered;
  }, [flashcards, searchTerm, difficultyFilter, showFavoritesOnly]);

  const toggleFavorite = (cardId: string) => {
    setFlashcards(prevCards =>
      prevCards.map(card =>
        card.id === cardId ? { ...card, isFavorite: !card.isFavorite } : card
      )
    );
  };

  const flipCard = (card: Flashcard) => {
    if (currentCard?.id === card.id) {
      setIsFlipped(!isFlipped);
    } else {
      setCurrentCard(card);
      setIsFlipped(true);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return styles.difficultyEasy;
      case 'medium': return styles.difficultyMedium;
      case 'hard': return styles.difficultyHard;
      default: return styles.difficultyEasy;
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.loading}>Loading flashcards...</div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.huskyContainer}>
            <img src={huskyIcon} alt="Husky" className={styles.huskyImg} />
          </div>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Flashcards</h1>
            <p className={styles.subtitle}>
              Master new vocabulary with interactive flashcards
            </p>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><Layers size={24} /></div>
            <span className={styles.statNumber}>{flashcards.length}</span>
            <span className={styles.statLabel}>Total Cards</span>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><Heart size={24} /></div>
            <span className={styles.statNumber}>
              {flashcards.filter(c => c.isFavorite).length}
            </span>
            <span className={styles.statLabel}>Favorites</span>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><Star size={24} /></div>
            <span className={styles.statNumber}>
              {flashcards.filter(c => c.difficulty === 'easy').length}
            </span>
            <span className={styles.statLabel}>Easy Cards</span>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }}
              />
              <input
                type="text"
                placeholder="Search flashcards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>
          <div className={styles.filters}>
            <div style={{ position: 'relative' }}>
              <Filter
                size={18}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}
              />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className={styles.filterSelect}
                style={{ paddingLeft: '40px' }}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className={styles.checkbox}
              />
              Favorites only
            </label>
          </div>
        </div>

        {filteredFlashcards.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No flashcards found matching your criteria.</p>
          </div>
        ) : (
          <div className={styles.flashcardsGrid}>
            {filteredFlashcards.map(card => (
              <div
                key={card.id}
                className={`${styles.flashcard} ${currentCard?.id === card.id && isFlipped ? styles.flipped : ''}`}
                onClick={() => flipCard(card)}
              >
                <div className={styles.flashcardInner}>
                  <div className={styles.flashcardFront}>
                    <div className={styles.cardContent}>
                      <div className={styles.cardText}>{card.front}</div>
                      <div className={styles.cardMeta}>
                        <span className={`${styles.difficulty} ${getDifficultyColor(card.difficulty)}`}>
                          {card.difficulty}
                        </span>
                        <span className={styles.category}>{card.category}</span>
                      </div>
                    </div>
                    <button
                      className={styles.favoriteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(card.id);
                      }}
                    >
                      {card.isFavorite ? <Heart size={20} fill="#ff6384" color="#ff6384" /> : <Heart size={20} color="rgba(255,255,255,0.4)" />}
                    </button>
                    <div className={styles.flipHint} style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '0.7rem', opacity: '0.6', fontStyle: 'italic' }}>
                      Click to flip ↻
                    </div>
                  </div>
                  <div className={styles.flashcardBack}>
                    <div className={styles.cardContent}>
                      <div className={styles.cardText}>{card.back}</div>
                      <div className={styles.cardMeta}>
                        <span className={`${styles.difficulty} ${getDifficultyColor(card.difficulty)}`}>
                          {card.difficulty}
                        </span>
                        <span className={styles.category}>{card.category}</span>
                      </div>
                    </div>
                    <button
                      className={styles.favoriteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(card.id);
                      }}
                    >
                      {card.isFavorite ? <Heart size={20} fill="#ff6384" color="#ff6384" /> : <Heart size={20} color="rgba(255,255,255,0.4)" />}
                    </button>
                    <div className={styles.flipHint} style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '0.7rem', opacity: '0.8', fontStyle: 'italic' }}>
                      Click to flip ↻
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
