import React, { useState, useEffect } from 'react';
import styles from './DailyCommitments.module.css';
import {
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  BookOpen,
  Headphones,
  Layout,
  MessageCircle,
  RefreshCw,
  Plus,
  Minus,
  Flame,
  TrendingUp,
} from 'lucide-react';
import huskyIcon from '../../assets/icons/husky.png';

interface DailyGoal {
  id: string;
  title: string;
  description: string;
  category: 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'practice' | 'review';
  target: number;
  current: number;
  unit: string;
  isCompleted: boolean;
  streak: number;
}

interface Commitment {
  id: string;
  date: string;
  goals: DailyGoal[];
  overallProgress: number;
  isCompleted: boolean;
}

const DailyCommitments: React.FC = () => {
  const [currentCommitment, setCurrentCommitment] = useState<Commitment | null>(null);
  const [commitmentHistory, setCommitmentHistory] = useState<Commitment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const mockGoals: DailyGoal[] = [
      {
        id: '1',
        title: 'Learn New Words',
        description: 'Add 5 new words to your vocabulary',
        category: 'vocabulary',
        target: 5,
        current: 3,
        unit: 'words',
        isCompleted: false,
        streak: 7,
      },
      {
        id: '2',
        title: 'Grammar Practice',
        description: 'Complete grammar exercises',
        category: 'grammar',
        target: 15,
        current: 15,
        unit: 'exercises',
        isCompleted: true,
        streak: 12,
      },
      {
        id: '3',
        title: 'Listen to English',
        description: 'Listen to English content for 30 minutes',
        category: 'listening',
        target: 30,
        current: 25,
        unit: 'minutes',
        isCompleted: false,
        streak: 5,
      },
      {
        id: '4',
        title: 'Reading Time',
        description: 'Read English text for 20 minutes',
        category: 'reading',
        target: 20,
        current: 20,
        unit: 'minutes',
        isCompleted: true,
        streak: 8,
      },
      {
        id: '5',
        title: 'Practice Speaking',
        description: 'Practice speaking for 10 minutes',
        category: 'practice',
        target: 10,
        current: 8,
        unit: 'minutes',
        isCompleted: false,
        streak: 3,
      },
      {
        id: '6',
        title: 'Review Flashcards',
        description: 'Review your flashcard deck',
        category: 'review',
        target: 20,
        current: 18,
        unit: 'cards',
        isCompleted: false,
        streak: 15,
      },
    ];

    const mockCommitment: Commitment = {
      id: 'today',
      date: new Date().toISOString().split('T')[0],
      goals: mockGoals,
      overallProgress: Math.round((mockGoals.filter(g => g.isCompleted).length / mockGoals.length) * 100),
      isCompleted: mockGoals.every(g => g.isCompleted),
    };

    const mockHistory: Commitment[] = [
      {
        id: 'yesterday',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        goals: mockGoals.map(g => ({ ...g, current: g.target, isCompleted: true })),
        overallProgress: 100,
        isCompleted: true,
      },
      {
        id: '2daysago',
        date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        goals: mockGoals.map(g => ({ ...g, current: Math.floor(g.target * 0.8), isCompleted: false })),
        overallProgress: 67,
        isCompleted: false,
      },
    ];

    setTimeout(() => {
      setCurrentCommitment(mockCommitment);
      setCommitmentHistory(mockHistory);
      setLoading(false);
    }, 1000);
  }, []);

  const updateGoalProgress = (goalId: string, newCurrent: number) => {
    if (!currentCommitment) return;

    const updatedGoals = currentCommitment.goals.map(goal =>
      goal.id === goalId
        ? {
          ...goal,
          current: Math.min(newCurrent, goal.target),
          isCompleted: newCurrent >= goal.target,
        }
        : goal
    );

    const completedGoals = updatedGoals.filter(g => g.isCompleted).length;
    const overallProgress = Math.round((completedGoals / updatedGoals.length) * 100);
    const isCompleted = updatedGoals.every(g => g.isCompleted);

    setCurrentCommitment({
      ...currentCommitment,
      goals: updatedGoals,
      overallProgress,
      isCompleted,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vocabulary': return <BookOpen size={24} />;
      case 'grammar': return <Layout size={24} />;
      case 'listening': return <Headphones size={24} />;
      case 'reading': return <BookOpen size={24} />;
      case 'practice': return <MessageCircle size={24} />;
      case 'review': return <RefreshCw size={24} />;
      default: return <Target size={24} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vocabulary': return styles['category.vocabulary'];
      case 'grammar': return styles['category.grammar'];
      case 'listening': return styles['category.listening'];
      case 'reading': return styles['category.reading'];
      case 'practice': return styles['category.practice'];
      case 'review': return styles['category.review'];
      default: return styles['category.default'];
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getCurrentStreak = () => {
    if (!currentCommitment) return 0;
    return Math.min(...currentCommitment.goals.map(g => g.streak));
  };

  const getCompletedGoals = () => {
    if (!currentCommitment) return 0;
    return currentCommitment.goals.filter(g => g.isCompleted).length;
  };

  if (loading) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.loading}>Loading daily commitments...</div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>
      <header className={styles.header}>
        <div className={styles.huskyContainer}>
          <img src={huskyIcon} alt="Husky" className={styles.huskyImg} />
        </div>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Daily Commitments</h1>
          <p className={styles.subtitle}>Track and achieve your daily English learning goals</p>
        </div>
      </header>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{getCompletedGoals()}</span>
            <span className={styles.statLabel}>Completed Today</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{currentCommitment?.overallProgress || 0}%</span>
            <span className={styles.statLabel}>Overall Progress</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)' }}>
            <Flame size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{getCurrentStreak()}</span>
            <span className={styles.statLabel}>Day Streak</span>
          </div>
        </div>
      </section>

      <div className={styles.dateSelector}>
        <label htmlFor="date-select" className={styles.dateLabel}>
          <Calendar size={18} style={{ marginRight: '8px' }} />
          Select Date:
        </label>
        <input
          id="date-select"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={styles.dateInput}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {currentCommitment && (
        <div className={styles.commitmentSection}>
          <div className={styles.commitmentHeader}>
            <h2 className={styles.commitmentTitle}>
              <h2 className={styles.commitmentTitle}>
                {selectedDate === new Date().toISOString().split('T')[0] ? "Today's Goals" : `Goals for ${new Date(selectedDate).toLocaleDateString()}`}
              </h2>              </h2>
            <div className={styles.progressOverview}>
              <div className={styles.progressCircle}>
                <svg width="80" height="80">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="rgba(127, 179, 213, 0.2)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="#7fb3d5"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - currentCommitment.overallProgress / 100)}`}
                    transform="rotate(-90 40 40)"
                    strokeLinecap="round"
                  />
                </svg>
                <span className={styles.progressText}>
                  {currentCommitment.overallProgress}%
                </span>
              </div>
              {currentCommitment.isCompleted && (
                <div className={styles.completedBadge}>
                  🎉 All Done!
                </div>
              )}
            </div>
          </div>

          <div className={styles.goalsGrid}>
            {currentCommitment.goals.map(goal => (
              <div
                key={goal.id}
                className={`${styles.goalCard} ${goal.isCompleted ? styles.completed : ''}`}
              >
                <div className={styles.goalHeader}>
                  <div className={styles.goalIcon}>
                    {getCategoryIcon(goal.category)}
                  </div>
                  <span className={`${styles.categoryBadge} ${getCategoryColor(goal.category)}`}>
                    {goal.category}
                  </span>
                </div>

                <div className={styles.goalContent}>
                  <h3 className={styles.goalTitle}>{goal.title}</h3>
                  <p className={styles.goalDescription}>{goal.description}</p>

                  <div className={styles.goalProgress}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${getProgressPercentage(goal.current, goal.target)}%`
                        }}
                      />
                    </div>
                    <span className={styles.progressNumbers}>
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>

                  <div className={styles.goalControls}>
                    <button
                      className={styles.adjustButton}
                      onClick={() => updateGoalProgress(goal.id, goal.current - 1)}
                      disabled={goal.current <= 0}
                    >
                      <Minus size={18} />
                    </button>
                    <input
                      type="number"
                      value={goal.current}
                      onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value) || 0)}
                      className={styles.progressInput}
                      min="0"
                      max={goal.target}
                    />
                    <button
                      className={styles.adjustButton}
                      onClick={() => updateGoalProgress(goal.id, goal.current + 1)}
                      disabled={goal.current >= goal.target}
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className={styles.goalFooter}>
                    <span className={styles.streak}>
                      <Flame size={16} style={{ marginRight: '4px' }} />
                      {goal.streak} day streak
                    </span>
                    {goal.isCompleted && (
                      <span className={styles.completedIcon}>
                        <CheckCircle2 size={24} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {commitmentHistory.length > 0 && (
        <div className={styles.historySection}>
          <h2 className={styles.historyTitle}>Recent History</h2>
          <div className={styles.historyList}>
            {commitmentHistory.map(commitment => (
              <div key={commitment.id} className={styles.historyItem}>
                <div className={styles.historyDate}>
                  {new Date(commitment.date).toLocaleDateString()}
                </div>
                <div className={styles.historyProgress}>
                  <div className={styles.historyBar}>
                    <div
                      className={styles.historyFill}
                      style={{ width: `${commitment.overallProgress}%` }}
                    />
                  </div>
                  <span className={styles.historyPercent}>
                    {commitment.overallProgress}%
                  </span>
                </div>
                <div className={styles.historyStatus}>
                  {commitment.isCompleted ? <CheckCircle2 size={20} color="#4caf50" /> : <Clock size={20} color="#7fb3d5" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyCommitments;