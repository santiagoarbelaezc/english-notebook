import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Trophy, Files, MessageCircle, Music,
  Star, Target, Film, FileText, Flame, Award,
  Layers, PenTool, TrendingUp, Zap, RefreshCw,
  AlertCircle, Check,
} from 'lucide-react';

import styles from './Dashboard.module.css';
import { useAuth } from '../../contexts/AuthContext';
import huskyVideo from '../../assets/videos/video-husky2.mp4';
import { getRandomPhrase } from '../../api/dailyPhrases.api';
import type { DailyPhrase } from '../../types';

// ── Stats API imports ────────────────────────────────────────────────────────
import { getProfileSummary, getLearningProgress, recalculateStats } from '../../api/profiles.api';
import { getVocabularyStats } from '../../api/vocabulary.api';
import { getGrammarStats } from '../../api/grammar.api';
import { getConversationStats } from '../../api/conversations.api';
import { getSongStats } from '../../api/songs.api';
import { getTextStats } from '../../api/texts.api';
import { getFlashcardStats } from '../../api/flashcards.api';
import { getCommitmentStats } from '../../api/dailyCommitments.api';
import { getAchievementStats } from '../../api/achievements.api';

// ── Types ────────────────────────────────────────────────────────────────────

interface StatBlock {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  extra?: string;
}

interface ProgressBar {
  label: string;
  icon: React.ReactNode;
  current: number;
  max: number;
  color: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export const Dashboard = () => {
  const { user } = useAuth();

  // Data
  const [profileSummary, setProfileSummary] = useState<any>(null);
  const [dailyPhrase, setDailyPhrase] = useState<DailyPhrase | null>(null);
  const [stats, setStats] = useState<StatBlock[]>([]);
  const [progress, setProgress] = useState<ProgressBar[]>([]);
  const [barChart, setBarChart] = useState<{ label: string; value: number; color: string }[]>([]);

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (m: string, t: 'success' | 'error' = 'success') => {
    setToast({ message: m, type: t });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Helper to safely call an API ───────────────────────────────────────

  const safe = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    try { return await fn(); } catch { return null; }
  };

  // ── Load All Data ──────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);

    const [
      profileRes,
      phraseRes,
      vocabRes,
      gramRes,
      convRes,
      songRes,
      textRes,
      flashRes,
      commitRes,
      achieveRes,
      progressRes,
    ] = await Promise.all([
      safe(getProfileSummary),
      safe(getRandomPhrase),
      safe(getVocabularyStats),
      safe(getGrammarStats),
      safe(getConversationStats),
      safe(getSongStats),
      safe(getTextStats),
      safe(getFlashcardStats),
      safe(getCommitmentStats),
      safe(getAchievementStats),
      safe(getLearningProgress),
    ]);

    if (profileRes) setProfileSummary(profileRes);
    if (phraseRes) setDailyPhrase((phraseRes as any).phrase || phraseRes);

    // ── Build stat blocks ───────────────────────────────────────────────
    const blocks: StatBlock[] = [];
    const bars: ProgressBar[] = [];
    const chart: { label: string; value: number; color: string }[] = [];

    // Vocabulary
    const vStats = (vocabRes as any)?.stats || vocabRes;
    const vocabTotal = vStats?.totalWords ?? vStats?.total ?? 0;
    if (vStats) {
      blocks.push({ label: 'Vocabulary', value: vocabTotal, icon: <BookOpen size={26} />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', extra: `${vStats.masteredWords ?? 0} mastered` });
      bars.push({ label: 'Vocabulary', icon: <BookOpen size={16} />, current: vocabTotal, max: 500, color: '#667eea' });
      chart.push({ label: 'Vocab', value: vocabTotal, color: '#667eea' });
    }

    // Grammar
    const gStats = (gramRes as any)?.stats || gramRes;
    const gramTotal = gStats?.totalRules ?? gStats?.total ?? 0;
    if (gStats) {
      blocks.push({ label: 'Grammar Rules', value: gramTotal, icon: <PenTool size={26} />, gradient: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)' });
      bars.push({ label: 'Grammar', icon: <PenTool size={16} />, current: gramTotal, max: 100, color: '#764ba2' });
      chart.push({ label: 'Grammar', value: gramTotal, color: '#764ba2' });
    }

    // Flashcards
    const fStats = (flashRes as any)?.stats || flashRes;
    const flashTotal = fStats?.totalCards ?? fStats?.total ?? 0;
    if (fStats) {
      blocks.push({ label: 'Flashcards', value: flashTotal, icon: <Layers size={26} />, gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', extra: fStats.accuracyRate ? `${fStats.accuracyRate} accuracy` : undefined });
      bars.push({ label: 'Flashcards', icon: <Layers size={16} />, current: flashTotal, max: 200, color: '#fcb69f' });
      chart.push({ label: 'Flash', value: flashTotal, color: '#fcb69f' });
    }

    // Conversations
    const cStats = (convRes as any)?.stats || convRes;
    const convTotal = cStats?.totalConversations ?? cStats?.total ?? 0;
    if (cStats) {
      blocks.push({ label: 'Conversations', value: convTotal, icon: <MessageCircle size={26} />, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' });
      bars.push({ label: 'Conversations', icon: <MessageCircle size={16} />, current: convTotal, max: 50, color: '#f5576c' });
      chart.push({ label: 'Conv', value: convTotal, color: '#f5576c' });
    }

    // Songs
    const sStats = (songRes as any)?.stats || songRes;
    const songTotal = sStats?.totalSongs ?? sStats?.total ?? 0;
    if (sStats) {
      blocks.push({ label: 'Songs', value: songTotal, icon: <Music size={26} />, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' });
      chart.push({ label: 'Songs', value: songTotal, color: '#43e97b' });
    }

    // Texts
    const tStats = (textRes as any)?.stats || textRes;
    const textTotal = tStats?.totalTexts ?? tStats?.total ?? 0;
    if (tStats) {
      blocks.push({ label: 'Texts', value: textTotal, icon: <FileText size={26} />, gradient: 'linear-gradient(135deg, #a8edea 0%, #00d4ff 100%)' });
      chart.push({ label: 'Texts', value: textTotal, color: '#00d4ff' });
    }

    // Commitments
    const cmStats = (commitRes as any)?.stats || commitRes;
    const commitTotal = cmStats?.totalCommitments ?? cmStats?.total ?? 0;
    if (cmStats) {
      blocks.push({ label: 'Commitments', value: commitTotal, icon: <Target size={26} />, gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', extra: cmStats.completedCommitments ? `${cmStats.completedCommitments} done` : undefined });
    }

    // Achievements
    const aStats = (achieveRes as any)?.stats || achieveRes;
    const achieveTotal = aStats?.totalAchievements ?? aStats?.total ?? 0;
    if (aStats) {
      blocks.push({ label: 'Achievements', value: achieveTotal, icon: <Award size={26} />, gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' });
    }

    setStats(blocks);
    setProgress(bars);
    setBarChart(chart);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Recalculate ────────────────────────────────────────────────────────

  const handleRecalculate = async () => {
    setRefreshing(true);
    try {
      await safe(recalculateStats);
      await loadData();
      showToast('Stats refreshed!');
    } catch {
      showToast('Failed to refresh', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────

  const streakDays = profileSummary?.statistics?.streakDays ?? 0;
  const totalActivities = stats.reduce((sum, s) => sum + (typeof s.value === 'number' ? s.value : 0), 0);
  const maxBarValue = Math.max(...barChart.map(b => b.value), 1);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className={`${styles.pageContent} page-entrance`}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            Welcome Back, {(user?.name || user?.username || 'Learner').split(' ')[0]}!
          </h1>
          <p className={styles.subtitle}>Continue learning English in a fun and effective way</p>
          <p className={styles.description}>
            Track your progress across every component — vocabulary, flashcards, grammar,
            conversations, songs, texts, and more. All in one place.
          </p>
        </div>
        <div className={styles.huskyContainer}>
          <video src={huskyVideo} autoPlay loop muted playsInline className={styles.huskyVideo} />
        </div>
      </header>

      {/* ── TOP ROW: Streak + Total + Refresh ── */}
      <div className={styles.topRow}>
        <div className={styles.highlightCard}>
          <div className={styles.highlightIcon} style={{ background: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)' }}>
            <Flame size={30} />
          </div>
          <div>
            <p className={styles.highlightLabel}>Day Streak</p>
            <span className={styles.highlightValue}>{streakDays}</span>
          </div>
        </div>
        <div className={styles.highlightCard}>
          <div className={styles.highlightIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <TrendingUp size={30} />
          </div>
          <div>
            <p className={styles.highlightLabel}>Total Items</p>
            <span className={styles.highlightValue}>{totalActivities}</span>
          </div>
        </div>
        <div className={styles.highlightCard}>
          <div className={styles.highlightIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Zap size={30} />
          </div>
          <div>
            <p className={styles.highlightLabel}>Components Active</p>
            <span className={styles.highlightValue}>{stats.filter(s => Number(s.value) > 0).length}</span>
          </div>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={handleRecalculate}
          disabled={refreshing}
          title="Refresh stats"
        >
          <RefreshCw size={20} className={refreshing ? styles.spinning : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ── STATS GRID ── */}
      {loading ? (
        <div className={styles.loadingState}>
          <RefreshCw size={36} className={styles.spinning} />
          <p>Loading your stats...</p>
        </div>
      ) : (
        <>
          <section className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>
              <Star size={22} color="#a8edea" /> Component Overview
            </h2>
            <div className={styles.statsGrid}>
              {stats.map((s, i) => (
                <div key={i} className={styles.statCard}>
                  <div className={styles.statIcon} style={{ background: s.gradient }}>
                    {s.icon}
                  </div>
                  <div className={styles.statContent}>
                    <p className={styles.statLabel}>{s.label}</p>
                    <span className={styles.statValue}>{s.value}</span>
                    {s.extra && <span className={styles.statExtra}>{s.extra}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── BAR CHART ── */}
          {barChart.length > 0 && (
            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>
                <Trophy size={22} color="#f093fb" /> Activity Distribution
              </h2>
              <div className={styles.barChart}>
                {barChart.map((bar, i) => {
                  const pct = Math.round((bar.value / maxBarValue) * 100);
                  return (
                    <div key={i} className={styles.barCol}>
                      <span className={styles.barValue}>{bar.value}</span>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.barFill}
                          style={{ height: `${Math.max(pct, 4)}%`, background: bar.color }}
                        />
                      </div>
                      <span className={styles.barLabel}>{bar.label}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── PROGRESS BARS ── */}
          {progress.length > 0 && (
            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>
                <Target size={22} color="#667eea" /> Goal Progress
              </h2>
              <div className={styles.progressList}>
                {progress.map((p, i) => {
                  const pct = Math.min(Math.round((p.current / p.max) * 100), 100);
                  return (
                    <div key={i} className={styles.progressRow}>
                      <div className={styles.progressRowLabel}>
                        {p.icon}
                        <span>{p.label}</span>
                      </div>
                      <div className={styles.progressRowBar}>
                        <div className={styles.progressTrack}>
                          <div className={styles.progressFill} style={{ width: `${pct}%`, background: p.color }} />
                        </div>
                      </div>
                      <span className={styles.progressPct}>{pct}%</span>
                      <span className={styles.progressCount}>{p.current}/{p.max}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── DAILY PHRASE ── */}
          {dailyPhrase && (
            <section className={styles.sectionBlock}>
              <h2 className={styles.sectionTitle}>
                <Star size={22} color="#fbbf24" /> Daily Phrase
              </h2>
              <div className={styles.phraseCard}>
                <p className={styles.phraseText}>"{dailyPhrase.phrase}"</p>
                <p className={styles.phraseTranslation}>{dailyPhrase.translation}</p>
                {dailyPhrase.type && (
                  <span className={styles.phraseBadge}>{dailyPhrase.type}</span>
                )}
              </div>
            </section>
          )}
        </>
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

export default Dashboard;