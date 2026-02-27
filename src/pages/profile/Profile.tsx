import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, PenTool, MessageSquare, Music,
  Camera, User, Mail, Globe, Award, TrendingUp,
  Star, Edit2, Check, X, Archive, Layers,
  Target, Flame, Clock, CheckCircle2, AlertCircle,
  FileText, Zap, Heart, Save,
} from 'lucide-react';
import styles from './Profile.module.css';
import videoHusky from '../../assets/videos/video-husky10.mp4';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import {
  getMyProfile,
  getProfileSummary,
  getDetailedStats,
  updateProfile,
  uploadProfileImage,
  getLearningProgress,
  recalculateStats,
} from '../../api/profiles.api';
import { updateUserProfile } from '../../api/users.api';
import type { Profile as ProfileData, ProfileSummary, DetailedStats } from '../../api/profiles.api';
import type { UpdateUserData } from '../../types/user.types';
import { useAuth } from '../../contexts/AuthContext';

// Try importing individual stats APIs — they may fail if not yet registered in backend
import { getVocabularyStats } from '../../api/vocabulary.api';
import { getGrammarStats } from '../../api/grammar.api';
import { getConversationStats } from '../../api/conversations.api';
import { getSongStats } from '../../api/songs.api';
import { getTextStats } from '../../api/texts.api';
import { getFlashcardStats } from '../../api/flashcards.api';
import { getCommitmentStats } from '../../api/dailyCommitments.api';
import { getAchievementStats } from '../../api/achievements.api';

// ── Types ────────────────────────────────────────────────────────────────────

interface ComponentStat {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  extra?: string;
}

interface ProgressItem {
  label: string;
  icon: React.ReactNode;
  current: number;
  max: number;
  color: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', nativeLanguage: '', englishLevel: '' });
  const [showImageModal, setShowImageModal] = useState(false);

  // All-component stats
  const [componentStats, setComponentStats] = useState<ComponentStat[]>([]);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load Profile ─────────────────────────────────────────────────────────

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileData, summaryData, statsData] = await Promise.all([
        getMyProfile(),
        getProfileSummary(),
        getDetailedStats(),
      ]);
      setProfile(profileData);
      setSummary(summaryData);
      setStats(statsData);

      if (profileData?.user) {
        setEditForm({
          name: profileData.user.name || '',
          bio: profileData.bio || '',
          nativeLanguage: profileData.nativeLanguage || '',
          englishLevel: profileData.user.englishLevel || '',
        });
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError('Error loading profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load All Component Stats ─────────────────────────────────────────────

  const loadAllComponentStats = useCallback(async () => {
    setLoadingStats(true);
    const results: ComponentStat[] = [];
    const progress: ProgressItem[] = [];

    // Helper: try each API and push result, ignore failures
    const tryApi = async <T,>(
      fn: () => Promise<T>,
      onSuccess: (data: T) => void
    ) => {
      try {
        const res = await fn();
        onSuccess(res);
      } catch {
        // silently skip — component not registered in backend
      }
    };

    await Promise.allSettled([
      tryApi(getVocabularyStats, (res: any) => {
        const s = res.stats || res;
        results.push({ label: 'Vocabulary', value: s.totalWords ?? s.total ?? 0, icon: <BookOpen size={24} />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', extra: `${s.masteredWords ?? 0} mastered` });
        progress.push({ label: 'Vocabulary', icon: <BookOpen size={16} />, current: s.totalWords ?? s.total ?? 0, max: 500, color: '#667eea' });
      }),
      tryApi(getGrammarStats, (res: any) => {
        const s = res.stats || res;
        results.push({ label: 'Grammar', value: s.totalRules ?? s.total ?? 0, icon: <PenTool size={24} />, gradient: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)' });
        progress.push({ label: 'Grammar', icon: <PenTool size={16} />, current: s.totalRules ?? s.total ?? 0, max: 100, color: '#764ba2' });
      }),
      tryApi(getConversationStats, (res: any) => {
        const s = res.stats || res;
        results.push({ label: 'Conversations', value: s.totalConversations ?? s.total ?? 0, icon: <MessageSquare size={24} />, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' });
        progress.push({ label: 'Conversations', icon: <MessageSquare size={16} />, current: s.totalConversations ?? s.total ?? 0, max: 50, color: '#f5576c' });
      }),
      tryApi(getSongStats, (res: any) => {
        const s = res.stats || res;
        results.push({ label: 'Songs', value: s.totalSongs ?? s.total ?? 0, icon: <Music size={24} />, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' });
      }),
      tryApi(getTextStats, (res: any) => {
        const s = res.stats || res;
        results.push({ label: 'Texts', value: s.totalTexts ?? s.total ?? 0, icon: <FileText size={24} />, gradient: 'linear-gradient(135deg, #a8edea 0%, #00d4ff 100%)' });
      }),
      tryApi(getFlashcardStats, (res: any) => {
        const s = res.stats || res;
        results.push({ label: 'Flashcards', value: s.totalCards ?? s.total ?? 0, icon: <Layers size={24} />, gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', extra: s.accuracyRate ? `${s.accuracyRate} accuracy` : undefined });
      }),
      tryApi(getCommitmentStats, (res: any) => {
        const s = res.stats || res;
        results.push({ label: 'Commitments', value: s.totalCommitments ?? s.total ?? 0, icon: <Target size={24} />, gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', extra: s.completedCommitments ? `${s.completedCommitments} done` : undefined });
      }),
      tryApi(getAchievementStats, (res: any) => {
        const s = res.stats || res;
        results.push({ label: 'Achievements', value: s.totalAchievements ?? s.total ?? 0, icon: <Award size={24} />, gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' });
      }),
    ]);

    setComponentStats(results);
    setProgressItems(progress);
    setLoadingStats(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadAllComponentStats();
    }
  }, [user, loadProfileData, loadAllComponentStats]);

  // ── Edit Handlers ─────────────────────────────────────────────────────────

  const handleInputChange = (field: string, value: string) =>
    setEditForm(prev => ({ ...prev, [field]: value }));

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const userData: UpdateUserData = {
        name: editForm.name,
        englishLevel: editForm.englishLevel as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
      };
      const profileData = { bio: editForm.bio, nativeLanguage: editForm.nativeLanguage };

      await Promise.all([updateUserProfile(userData), updateProfile(profileData)]);

      // Optimistic update
      if (profile) {
        setProfile({
          ...profile,
          user: { ...profile.user, name: editForm.name, englishLevel: editForm.englishLevel },
          bio: editForm.bio,
          nativeLanguage: editForm.nativeLanguage,
        });
      }
      if (summary) {
        setSummary({
          ...summary,
          user: { ...summary.user, name: editForm.name, englishLevel: editForm.englishLevel, bio: editForm.bio },
        });
      }
      setIsEditing(false);
      showToast('Profile updated successfully!');
    } catch (err: any) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const result = await uploadProfileImage(file);
      setProfile(prev => prev ? { ...prev, profileImage: result.profileImage } : null);
      showToast('Profile image updated!');
    } catch {
      showToast('Failed to upload image', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setLoadingStats(true);
      await recalculateStats();
      await loadProfileData();
      await loadAllComponentStats();
      showToast('Stats recalculated!');
    } catch {
      showToast('Failed to recalculate', 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getLevelColor = (level?: string) => {
    switch (level?.toUpperCase()) {
      case 'A1': case 'A2': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'B1': case 'B2': return 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)';
      case 'C1': case 'C2': return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '—';

  // ── Loading / Error States ────────────────────────────────────────────────

  if (loading && !profile) return <LoadingOverlay message="Loading your profile..." />;

  if (error && !profile) {
    return (
      <div className={`${styles.pageContent} page-entrance`}>
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !summary) {
    return (
      <div className={`${styles.pageContent} page-entrance`}>
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <p>Could not load profile data</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`${styles.pageContent} page-entrance`}>
      {error && <div className={styles.errorBanner}><AlertCircle size={18} /> {error}</div>}

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            {/* Avatar */}
            <div className={styles.profileAvatar} onClick={() => !isEditing && setShowImageModal(true)}>
              {profile.profileImage ? (
                <img src={profile.profileImage} alt="Profile" className={styles.avatarImage} />
              ) : (
                <span className={styles.avatarPlaceholder}>
                  {profile.user?.name?.[0] || profile.user?.username?.[0]?.toUpperCase() || '?'}
                </span>
              )}
              {isEditing && (
                <label className={styles.imageUpload}>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  <Camera size={18} color="#fff" />
                </label>
              )}
            </div>
            {/* Info */}
            <div className={styles.headerInfo}>
              <span className={styles.greetingBadge}>{getGreeting()}</span>
              <h1 className={styles.title}>
                {isEditing ? (
                  <input
                    type="text" value={editForm.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="Your name" className={styles.editInputInline}
                  />
                ) : (
                  profile.user?.name || profile.user?.username || 'User'
                )}
              </h1>
              <p className={styles.subtitle}>{profile.user?.email}</p>
              <div className={styles.headerMeta}>
                <span className={styles.metaBadge}>
                  <Clock size={14} /> Member since {memberSince}
                </span>
                <span className={styles.metaBadge}>
                  <Globe size={14} /> {profile.nativeLanguage || 'Not set'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.huskyContainer}>
          <video src={videoHusky} autoPlay loop muted playsInline className={styles.huskyVideo} />
        </div>
      </header>

      {/* ── TOP ACTIONS ── */}
      <div className={styles.topActions}>
        {isEditing ? (
          <>
            <button onClick={handleSaveProfile} className={styles.actionPrimary} disabled={loading}>
              <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => setIsEditing(false)} className={styles.actionSecondary} disabled={loading}>
              <X size={18} /> Cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} className={styles.actionPrimary}>
              <Edit2 size={18} /> Edit Profile
            </button>
            <button onClick={handleRecalculate} className={styles.actionSecondary} disabled={loadingStats}>
              <Zap size={18} /> {loadingStats ? 'Recalculating...' : 'Recalculate Stats'}
            </button>
          </>
        )}
      </div>

      {/* ── QUICK STATS ROW ── */}
      <div className={styles.quickStats}>
        <div className={styles.quickStatCard}>
          <div className={styles.quickStatIcon} style={{ background: getLevelColor(summary.user.englishLevel) }}>
            <Award size={26} />
          </div>
          <div className={styles.quickStatContent}>
            <p className={styles.quickStatLabel}>English Level</p>
            <span className={styles.quickStatValue}>
              {isEditing ? (
                <select value={editForm.englishLevel} onChange={e => handleInputChange('englishLevel', e.target.value)} className={styles.inlineSelect}>
                  <option value="">Select</option>
                  <option value="A1">A1</option><option value="A2">A2</option>
                  <option value="B1">B1</option><option value="B2">B2</option>
                  <option value="C1">C1</option><option value="C2">C2</option>
                </select>
              ) : (
                summary.user.englishLevel || 'N/A'
              )}
            </span>
          </div>
        </div>
        <div className={styles.quickStatCard}>
          <div className={styles.quickStatIcon} style={{ background: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)' }}>
            <Flame size={26} />
          </div>
          <div className={styles.quickStatContent}>
            <p className={styles.quickStatLabel}>Day Streak</p>
            <span className={styles.quickStatValue}>{stats?.streak?.current ?? profile.statistics?.streakDays ?? 0}</span>
          </div>
        </div>
        <div className={styles.quickStatCard}>
          <div className={styles.quickStatIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <Star size={26} />
          </div>
          <div className={styles.quickStatContent}>
            <p className={styles.quickStatLabel}>Total Activities</p>
            <span className={styles.quickStatValue}>
              {(profile.statistics?.totalVocabulary || 0) + (profile.statistics?.totalGrammarRules || 0)
                + (profile.statistics?.totalConversations || 0) + (profile.statistics?.totalSongs || 0)}
            </span>
          </div>
        </div>
        <div className={styles.quickStatCard}>
          <div className={styles.quickStatIcon} style={{ background: 'linear-gradient(135deg, #a8edea 0%, #00d4ff 100%)' }}>
            <TrendingUp size={26} />
          </div>
          <div className={styles.quickStatContent}>
            <p className={styles.quickStatLabel}>Components Used</p>
            <span className={styles.quickStatValue}>{componentStats.filter(s => Number(s.value) > 0).length}</span>
          </div>
        </div>
      </div>

      {/* ── PERSONAL DETAILS ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <User size={24} color="#a8edea" /> Personal Details
          </h2>
        </div>
        <div className={styles.detailsGrid}>
          {isEditing ? (
            <div className={styles.editContainer}>
              <div className={styles.formGroup}>
                <label><Edit2 size={14} /> Biography</label>
                <textarea
                  value={editForm.bio}
                  onChange={e => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about your learning journey..."
                  rows={4}
                />
              </div>
              <div className={styles.formGroup}>
                <label><Globe size={14} /> Native Language</label>
                <input
                  type="text" value={editForm.nativeLanguage}
                  onChange={e => handleInputChange('nativeLanguage', e.target.value)}
                  placeholder="e.g. Spanish"
                />
              </div>
            </div>
          ) : (
            <>
              <div className={`${styles.detailCard} ${styles.bioCard}`}>
                <span className={styles.detailLabel}><Edit2 size={16} /> Biography</span>
                <p className={styles.detailValue}>
                  {profile.bio || 'No biography yet. Click "Edit Profile" to add one!'}
                </p>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}><Globe size={16} /> Native Language</span>
                <p className={styles.detailValue}>{profile.nativeLanguage || 'Not specified'}</p>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}><Mail size={16} /> Email</span>
                <p className={styles.detailValue}>{profile.user?.email}</p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── ALL-COMPONENT STATS GRID ── */}
      {componentStats.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <TrendingUp size={24} color="#43e97b" /> Learning Overview
            </h2>
          </div>
          <div className={styles.componentStatsGrid}>
            {componentStats.map((stat, i) => (
              <div key={i} className={styles.componentStatCard}>
                <div className={styles.componentStatIcon} style={{ background: stat.gradient }}>
                  {stat.icon}
                </div>
                <div className={styles.componentStatContent}>
                  <p className={styles.componentStatLabel}>{stat.label}</p>
                  <span className={styles.componentStatValue}>{stat.value}</span>
                  {stat.extra && <span className={styles.componentStatExtra}>{stat.extra}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PROGRESS BARS ── */}
      {progressItems.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <CheckCircle2 size={24} color="#667eea" /> Progress Tracker
            </h2>
          </div>
          <div className={styles.progressList}>
            {progressItems.map((item, i) => {
              const pct = Math.min(Math.round((item.current / item.max) * 100), 100);
              return (
                <div key={i} className={styles.progressRow}>
                  <div className={styles.progressRowLabel}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <div className={styles.progressRowBar}>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                  <span className={styles.progressRowPct}>{pct}%</span>
                  <span className={styles.progressRowCount}>{item.current}/{item.max}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── IMAGE MODAL ── */}
      {showImageModal && profile.profileImage && (
        <div className={styles.imageModalOverlay} onClick={() => setShowImageModal(false)}>
          <div className={styles.largeImageContainer}>
            <button className={styles.closeModal} onClick={() => setShowImageModal(false)}>
              <X size={24} />
            </button>
            <img
              src={profile.profileImage} alt="Profile zoomed"
              className={styles.largeImage}
              onClick={e => e.stopPropagation()}
            />
          </div>
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

export default Profile;
