import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Target,
  Flame,
  BookOpen,
  Mic2,
  PenTool,
  Star,
  Lock,
  CheckCircle2,
  Calendar,
  Award
} from 'lucide-react';
import styles from './Achievements.module.css';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'vocabulary' | 'grammar' | 'listening' | 'reading';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedDate?: string;
  points: number;
}

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '👶',
        category: 'learning',
        difficulty: 'easy',
        progress: 1,
        maxProgress: 1,
        isUnlocked: true,
        unlockedDate: '2024-01-15',
        points: 10,
      },
      {
        id: '2',
        title: 'Vocabulary Master',
        description: 'Learn 100 new words',
        icon: '📚',
        category: 'vocabulary',
        difficulty: 'medium',
        progress: 87,
        maxProgress: 100,
        isUnlocked: false,
        points: 50,
      },
      {
        id: '3',
        title: 'Grammar Guru',
        description: 'Complete all grammar exercises',
        icon: '🎯',
        category: 'grammar',
        difficulty: 'hard',
        progress: 45,
        maxProgress: 50,
        isUnlocked: false,
        points: 100,
      },
      {
        id: '4',
        title: 'Listening Champion',
        description: 'Listen to 50 songs or podcasts',
        icon: '🎧',
        category: 'listening',
        difficulty: 'medium',
        progress: 23,
        maxProgress: 50,
        isUnlocked: false,
        points: 75,
      },
      {
        id: '5',
        title: 'Reading Hero',
        description: 'Read 10 full texts',
        icon: '📖',
        category: 'reading',
        difficulty: 'medium',
        progress: 7,
        maxProgress: 10,
        isUnlocked: false,
        points: 60,
      },
      {
        id: '6',
        title: 'Streak Master',
        description: 'Maintain a 30-day learning streak',
        icon: '🔥',
        category: 'streak',
        difficulty: 'hard',
        progress: 15,
        maxProgress: 30,
        isUnlocked: false,
        points: 150,
      },
      {
        id: '7',
        title: 'Flashcard Wizard',
        description: 'Complete 500 flashcard reviews',
        icon: '🃏',
        category: 'vocabulary',
        difficulty: 'hard',
        progress: 234,
        maxProgress: 500,
        isUnlocked: false,
        points: 200,
      },
      {
        id: '8',
        title: 'Legendary Learner',
        description: 'Reach 1000 total points',
        icon: '👑',
        category: 'learning',
        difficulty: 'legendary',
        progress: 650,
        maxProgress: 1000,
        isUnlocked: false,
        points: 500,
      },
      {
        id: '9',
        title: 'Conversation Starter',
        description: 'Complete 20 conversation practices',
        icon: '💬',
        category: 'learning',
        difficulty: 'medium',
        progress: 12,
        maxProgress: 20,
        isUnlocked: false,
        points: 80,
      },
      {
        id: '10',
        title: 'Perfect Week',
        description: 'Complete all daily goals for 7 days',
        icon: '⭐',
        category: 'streak',
        difficulty: 'medium',
        progress: 3,
        maxProgress: 7,
        isUnlocked: false,
        points: 120,
      },
    ];

    setTimeout(() => {
      setAchievements(mockAchievements);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAchievements = React.useMemo(() => {
    let filtered = achievements;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(achievement => achievement.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(achievement => achievement.difficulty === selectedDifficulty);
    }

    if (showOnlyUnlocked) {
      filtered = filtered.filter(achievement => achievement.isUnlocked);
    }

    return filtered;
  }, [achievements, selectedCategory, selectedDifficulty, showOnlyUnlocked]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'learning': return <BookOpen className={styles.categoryIcon} size={24} />;
      case 'streak': return <Flame className={styles.categoryIcon} size={24} />;
      case 'vocabulary': return <Target className={styles.categoryIcon} size={24} />;
      case 'grammar': return <PenTool className={styles.categoryIcon} size={24} />;
      case 'listening': return <Mic2 className={styles.categoryIcon} size={24} />;
      case 'reading': return <BookOpen className={styles.categoryIcon} size={24} />;
      default: return <Trophy className={styles.categoryIcon} size={24} />;
    }
  };

  const getProgressPercentage = (progress: number, maxProgress: number) => {
    return Math.min((progress / maxProgress) * 100, 100);
  };

  const getTotalPoints = () => {
    return achievements
      .filter(a => a.isUnlocked)
      .reduce((sum, a) => sum + a.points, 0);
  };

  const getUnlockedCount = () => {
    return achievements.filter(a => a.isUnlocked).length;
  };

  if (loading) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.loading}>
          <Trophy size={48} className={styles.loadingIcon} />
          <p>Analyzing your achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>
      <header className={styles.header}>
        <h1 className={styles.title}>🏆 Achievements</h1>
        <p className={styles.subtitle}>
          Track your progress and unlock rewards as you master English
        </p>
      </header>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{getUnlockedCount()}</span>
          <span className={styles.statLabel}>Unlocked</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{achievements.length - getUnlockedCount()}</span>
          <span className={styles.statLabel}>Remaining</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{getTotalPoints()}</span>
          <span className={styles.statLabel}>Total Points</span>
        </div>
      </section>

      <div className={styles.controls}>
        <div className={styles.filters}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            <option value="learning">Learning</option>
            <option value="streak">Streaks</option>
            <option value="vocabulary">Vocabulary</option>
            <option value="grammar">Grammar</option>
            <option value="listening">Listening</option>
            <option value="reading">Reading</option>
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="legendary">Legendary</option>
          </select>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showOnlyUnlocked}
              onChange={(e) => setShowOnlyUnlocked(e.target.checked)}
              className={styles.checkbox}
            />
            <span>Show only unlocked</span>
          </label>
        </div>
      </div>

      <div className={styles.achievementsGrid}>
        {filteredAchievements.length > 0 ? (
          filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`${styles.achievementCard} ${achievement.isUnlocked ? styles.unlocked : styles.locked}`}
            >
              <div className={styles.achievementHeader}>
                <div className={styles.achievementIcon}>{achievement.icon}</div>
                <div className={styles.achievementMeta}>
                  <span className={`${styles.difficulty} ${styles[achievement.difficulty]}`}>
                    {achievement.difficulty}
                  </span>
                  {getCategoryIcon(achievement.category)}
                </div>
              </div>

              <div className={styles.achievementContent}>
                <h3 className={styles.achievementTitle}>{achievement.title}</h3>
                <p className={styles.achievementDescription}>{achievement.description}</p>

                {achievement.isUnlocked && achievement.unlockedDate && (
                  <div className={styles.unlockedDate}>
                    <Calendar size={14} />
                    Unlocked on {new Date(achievement.unlockedDate).toLocaleDateString()}
                  </div>
                )}

                <div className={styles.progressSection}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${getProgressPercentage(achievement.progress, achievement.maxProgress)}%` }}
                    />
                  </div>
                  <div className={styles.progressText}>
                    {achievement.progress} / {achievement.maxProgress} ({Math.round(getProgressPercentage(achievement.progress, achievement.maxProgress))}%)
                  </div>
                </div>
              </div>

              <div className={styles.achievementFooter}>
                <div className={styles.points}>
                  <Award size={18} />
                  {achievement.points} pts
                </div>
                {achievement.isUnlocked ? (
                  <span className={styles.unlockedBadge}>
                    <CheckCircle2 size={14} /> Unlocked
                  </span>
                ) : (
                  <span className={styles.lockedBadge}>
                    <Lock size={14} /> Locked
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No achievements found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
