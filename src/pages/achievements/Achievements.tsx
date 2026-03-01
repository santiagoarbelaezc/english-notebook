import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Flame, BookOpen, MessageCircle, Library,
  Star, CheckCircle2, Check, AlertCircle,
  Zap, Film, Music, FileText, Files,
  Lock, Unlock, Sparkles, Target, ChevronLeft, ChevronRight
} from 'lucide-react';
import huskyVideo from '../../assets/videos/video-husky14.mp4';
import styles from './Achievements.module.css';
import {
  getAllAchievements,
  getAchievementStats,
} from '../../api/achievements.api';
import type {
  Achievement,
  AchievementCategory,
} from '../../types';

// ── Category Config ──────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  conversation: 'Conversations',
  text: 'Texts',
  song: 'Songs',
  movie: 'Movies',
  flashcard: 'Flashcards',
  irregularVerb: 'Irregular Verbs',
  streak: 'Streak',
};

const CATEGORY_ICONS: Record<AchievementCategory, React.ReactNode> = {
  vocabulary: <BookOpen size={16} />,
  grammar: <Library size={16} />,
  conversation: <MessageCircle size={16} />,
  text: <FileText size={16} />,
  song: <Music size={16} />,
  movie: <Film size={16} />,
  flashcard: <Files size={16} />,
  irregularVerb: <Zap size={16} />,
  streak: <Flame size={16} />,
};

const CATEGORY_COLORS: Record<AchievementCategory, string> = {
  vocabulary: '#667eea',
  grammar: '#f093fb',
  conversation: '#43e97b',
  text: '#00d4ff',
  song: '#fda085',
  movie: '#a8edea',
  flashcard: '#f5576c',
  irregularVerb: '#fbbf24',
  streak: '#ff6b6b',
};

const ITEMS_PER_PAGE = 6;

// ── Main Component ───────────────────────────────────────────────────────────

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showStatus, setShowStatus] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Data Loading ─────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [achRes, statsRes] = await Promise.all([
        getAllAchievements(),
        getAchievementStats(),
      ]);
      setAchievements(achRes.achievements);
      setStats(statsRes.stats);
    } catch {
      showToast('Failed to load achievements', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filteredAchievements = achievements.filter(a => {
    const q = searchTerm.toLowerCase();
    if (q && !a.title.toLowerCase().includes(q) && !a.description.toLowerCase().includes(q)) return false;
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (showStatus === 'unlocked' && !a.unlocked) return false;
    if (showStatus === 'locked' && a.unlocked) return false;
    return true;
  }).sort((a, b) => {
    // Primary sort: Milestone
    if (a.milestone !== b.milestone) return a.milestone - b.milestone;

    // Secondary sort: Category
    if (a.category !== b.category) return a.category.localeCompare(b.category);

    // Tertiary sort: Unlocked status (unlocked first)
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;

    return 0;
  });

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCategory, showStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredAchievements.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAchievements = filteredAchievements.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // ── XP to next level calculation ──────────────────────────────────────────

  const xpForLevel = (lvl: number) => lvl * 100;
  const currentLevelXp = stats ? stats.experience - Array.from({ length: stats.level - 1 }, (_, i) => xpForLevel(i + 1)).reduce((a: number, b: number) => a + b, 0) : 0;
  const nextLevelXp = stats ? xpForLevel(stats.level) : 100;
  const levelProgress = stats ? Math.min((currentLevelXp / nextLevelXp) * 100, 100) : 0;

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading && achievements.length === 0) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.loading}>
          <Trophy size={40} className={styles.loadingIcon} />
          <p>Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.pageContent} page-entrance`}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Achievements</h1>
          <p className={styles.subtitle}>Achievements unlock automatically as you use the app</p>
        </div>
        <div className={styles.huskyContainer}>
          <video className={styles.huskyVideo} src={huskyVideo} autoPlay loop muted playsInline />
        </div>
      </header>

      {/* ── LEVEL & XP BAR ── */}
      {stats && (
        <div className={styles.levelSection}>
          <div className={styles.levelHeader}>
            <div className={styles.levelBadge}>
              <Sparkles size={20} />
              <span>Level {stats.level}</span>
            </div>
            <span className={styles.xpText}>{stats.experience} XP</span>
          </div>
          <div className={styles.xpBar}>
            <div className={styles.xpFill} style={{ width: `${levelProgress}%` }} />
          </div>
          <div className={styles.xpSubtext}>
            {currentLevelXp} / {nextLevelXp} XP to Level {stats.level + 1}
          </div>
        </div>
      )}

      {/* ── STATS ── */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Trophy size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.unlockedAchievements}/{stats.totalAchievements}</span>
              <span className={styles.statLabel}>Unlocked</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <Target size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.completionPercentage}%</span>
              <span className={styles.statLabel}>Completion</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}>
              <Zap size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.totalXpFromAchievements}</span>
              <span className={styles.statLabel}>XP Earned</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' }}>
              <Flame size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.streak?.current ?? 0}</span>
              <span className={styles.statLabel}>Day Streak</span>
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORY PROGRESS ── */}
      {stats?.byCategory && stats.byCategory.length > 0 && (
        <div className={styles.categorySection}>
          <h2 className={styles.sectionHeading}>Progress by Category</h2>
          <div className={styles.categoryGrid}>
            {stats.byCategory.map((cat: any) => {
              const pct = cat.total > 0 ? Math.round((cat.unlocked / cat.total) * 100) : 0;
              const color = CATEGORY_COLORS[cat._id as AchievementCategory] || '#667eea';
              return (
                <div key={cat._id} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryIcon} style={{ color }}>
                      {CATEGORY_ICONS[cat._id as AchievementCategory] || <Star size={16} />}
                    </span>
                    <span className={styles.categoryName}>
                      {CATEGORY_LABELS[cat._id as AchievementCategory] || cat._id}
                    </span>
                    <span className={styles.categoryCount}>{cat.unlocked}/{cat.total}</span>
                  </div>
                  <div className={styles.categoryBar}>
                    <div className={styles.categoryFill} style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── RECENT UNLOCKS ── */}
      {stats?.recentAchievements && stats.recentAchievements.length > 0 && (
        <div className={styles.recentSection}>
          <h2 className={styles.sectionHeading}>Recent Unlocks</h2>
          <div className={styles.recentList}>
            {stats.recentAchievements.map((a: any) => (
              <div key={a._id} className={styles.recentItem}>
                <span className={styles.recentIcon}>
                  {a.category === 'streak' ? a.icon : CATEGORY_ICONS[a.category as AchievementCategory] || a.icon}
                </span>
                <div className={styles.recentInfo}>
                  <span className={styles.recentTitle}>{a.title}</span>
                  <span className={styles.recentDate}>
                    {new Date(a.unlockedDate).toLocaleDateString()} · +{a.xpReward} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTROLS ── */}
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className={styles.filterSelect}>
            <option value="all">All Categories</option>
            {(Object.keys(CATEGORY_LABELS) as AchievementCategory[]).map(k => (
              <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
            ))}
          </select>
          <select value={showStatus} onChange={e => setShowStatus(e.target.value as any)} className={styles.filterSelect}>
            <option value="all">All Status</option>
            <option value="unlocked">Unlocked</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      {/* ── RESULTS INFO ── */}
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          Showing {startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, filteredAchievements.length)} of {filteredAchievements.length} achievements
        </span>
      </div>

      {/* ── ACHIEVEMENTS GRID ── */}
      {filteredAchievements.length === 0 ? (
        <div className={styles.emptyState}>
          <Trophy size={48} style={{ opacity: 0.25, marginBottom: '1rem' }} />
          <p>No achievements match your filters.</p>
          <button className={styles.clearFiltersBtn} onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setShowStatus('all'); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className={styles.achievementsGrid}>
          {paginatedAchievements.map(achievement => (
            <div
              key={achievement._id}
              className={`${styles.achievementCard} ${achievement.unlocked ? styles.cardUnlocked : styles.cardLocked}`}
            >
              {/* Card Top: Central Icon + Category + Status */}
              <div className={styles.cardHeaderVertical}>
                <div className={styles.iconWrapperLarge}>
                  {achievement.category === 'streak' ? (
                    <span className={styles.emojiIconLarge}>{achievement.icon || '🔥'}</span>
                  ) : (
                    <span className={styles.lucideIconLarge}>
                      {React.cloneElement(CATEGORY_ICONS[achievement.category] as React.ReactElement<any>, { size: 28 })}
                    </span>
                  )}
                  {achievement.unlocked && <span className={styles.unlockedGlow} />}
                </div>

                <div className={styles.cardMetaVertical}>
                  <span className={styles.categoryNameVertical}>
                    {CATEGORY_LABELS[achievement.category]}
                  </span>
                  <span className={`${styles.statusBadge} ${achievement.unlocked ? styles.statusUnlocked : styles.statusLocked}`}>
                    {achievement.unlocked ? <><Unlock size={12} /> Unlocked</> : <><Lock size={12} /> Locked</>}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className={styles.cardBody}>
                <h3 className={styles.achievementTitle}>{achievement.title}</h3>
                {achievement.description && (
                  <p className={styles.achievementDesc}>{achievement.description}</p>
                )}
              </div>

              {/* Progress */}
              {achievement.progress !== undefined && !achievement.unlocked && (
                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Progress</span>
                    <span className={styles.progressPct}>
                      {Math.round(achievement.progress)}%
                    </span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${Math.min(achievement.progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Card Footer */}
              <div className={styles.cardFooter}>
                <span className={styles.xpBadge}>
                  <Zap size={14} /> {achievement.xpReward} XP
                </span>
                <span className={styles.milestoneBadge}>
                  Milestone: {achievement.milestone}
                </span>
                {achievement.unlocked && achievement.unlockedDate && (
                  <span className={styles.dateBadge}>
                    <CheckCircle2 size={13} />
                    {new Date(achievement.unlockedDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Achievements;
