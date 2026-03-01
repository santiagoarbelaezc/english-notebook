import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, PenTool, MessageSquare, Music,
  Camera, User, Mail, Globe, Award, TrendingUp,
  Star, Edit2, Check, X, Layers,
  Flame, Clock, CheckCircle2, AlertCircle,
  FileText, Zap, Save, Film, Sparkles, Trophy,
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
  recalculateStats,
} from '../../api/profiles.api';
import { updateUserProfile } from '../../api/users.api';
import type { Profile as ProfileData, ProfileSummary, DetailedStats } from '../../api/profiles.api';
import type { UpdateUserData } from '../../types/user.types';
import { useAuth } from '../../contexts/AuthContext';

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
  const [loadingStats, setLoadingStats] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load Data ─────────────────────────────────────────────────────────

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

  useEffect(() => {
    if (user) loadProfileData();
  }, [user, loadProfileData]);

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
    } catch {
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
      const imageUrl = result.profileImage?.url || (result as any).profileImage;
      setProfile(prev => prev ? { ...prev, profileImage: imageUrl } : null);
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
      const result = await recalculateStats();
      await loadProfileData();
      if (result.newAchievements?.length > 0) {
        showToast(`Stats recalculated! ${result.newAchievements.length} new achievement(s) unlocked! 🏆`);
      } else {
        showToast('Stats recalculated!');
      }
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

  const xpForLevel = (lvl: number) => lvl * 100;
  const currentXp = profile?.experience || 0;
  const currentLevel = profile?.level || 1;
  const xpIntoLevel = currentXp - Array.from({ length: currentLevel - 1 }, (_, i) => xpForLevel(i + 1)).reduce((a, b) => a + b, 0);
  const xpNeeded = xpForLevel(currentLevel);
  const levelPct = Math.min((xpIntoLevel / xpNeeded) * 100, 100);

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '—';

  const totalActivities = profile ? (
    profile.statistics.totalVocabulary + profile.statistics.totalGrammarRules +
    profile.statistics.totalConversations + profile.statistics.totalSongs +
    (profile.statistics.totalTexts || 0) + (profile.statistics.totalMovies || 0) +
    (profile.statistics.totalFlashcards || 0) + (profile.statistics.totalIrregularVerbs || 0)
  ) : 0;

  // ── Component Stats ────────────────────────────────────────────────────

  const componentStats = profile ? [
    { label: 'Vocabulary', value: profile.statistics.totalVocabulary, icon: <BookOpen size={22} />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#667eea' },
    { label: 'Grammar', value: profile.statistics.totalGrammarRules, icon: <PenTool size={22} />, gradient: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)', color: '#764ba2' },
    { label: 'Conversations', value: profile.statistics.totalConversations, icon: <MessageSquare size={22} />, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#f5576c' },
    { label: 'Songs', value: profile.statistics.totalSongs, icon: <Music size={22} />, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#43e97b' },
    { label: 'Texts', value: profile.statistics.totalTexts || 0, icon: <FileText size={22} />, gradient: 'linear-gradient(135deg, #a8edea 0%, #00d4ff 100%)', color: '#00d4ff' },
    { label: 'Movies', value: profile.statistics.totalMovies || 0, icon: <Film size={22} />, gradient: 'linear-gradient(135deg, #fda085 0%, #f6d365 100%)', color: '#fda085' },
    { label: 'Flashcards', value: profile.statistics.totalFlashcards || 0, icon: <Layers size={22} />, gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: '#fcb69f' },
    { label: 'Irregular Verbs', value: profile.statistics.totalIrregularVerbs || 0, icon: <Zap size={22} />, gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#fbbf24' },
  ] : [];

  // ── Loading / Error States ────────────────────────────────────────────────

  if (loading && !profile) return <LoadingOverlay message="Loading your profile..." />;

  if ((error || !profile || !summary) && !loading) {
    return (
      <div className={`${styles.pageContent} page-entrance`}>
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <p>{error || 'Could not load profile data'}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !summary) return null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`${styles.pageContent} page-entrance`}>
      {error && <div className={styles.errorBanner}><AlertCircle size={18} /> {error}</div>}

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            {/* Avatar */}
            <div className={styles.profileAvatar}>
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

      {/* ── LEVEL & XP BAR ── */}
      <div className={styles.levelSection}>
        <div className={styles.levelHeader}>
          <div className={styles.levelBadge}>
            <Sparkles size={20} />
            <span>Level {currentLevel}</span>
          </div>
          <span className={styles.xpText}>{currentXp} XP Total</span>
        </div>
        <div className={styles.xpBar}>
          <div className={styles.xpFill} style={{ width: `${levelPct}%` }} />
        </div>
        <div className={styles.xpSubtext}>
          {xpIntoLevel} / {xpNeeded} XP to Level {currentLevel + 1}
        </div>
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
            <span className={styles.quickStatValue}>
              {stats?.streak?.current ?? profile.statistics?.streakDays ?? 0}
            </span>
            {(stats?.streak?.longest || profile.statistics?.longestStreak) ? (
              <span className={styles.quickStatExtra}>Best: {stats?.streak?.longest ?? profile.statistics?.longestStreak ?? 0}</span>
            ) : null}
          </div>
        </div>
        <div className={styles.quickStatCard}>
          <div className={styles.quickStatIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <Star size={26} />
          </div>
          <div className={styles.quickStatContent}>
            <p className={styles.quickStatLabel}>Total Activities</p>
            <span className={styles.quickStatValue}>{totalActivities}</span>
          </div>
        </div>
        <div className={styles.quickStatCard}>
          <div className={styles.quickStatIcon} style={{ background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' }}>
            <Trophy size={26} />
          </div>
          <div className={styles.quickStatContent}>
            <p className={styles.quickStatLabel}>Achievements</p>
            <span className={styles.quickStatValue}>
              {summary.achievements?.unlocked ?? 0}/{summary.achievements?.total ?? 0}
            </span>
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
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PROGRESS BARS ── */}
      {componentStats.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <CheckCircle2 size={24} color="#667eea" /> Progress Tracker
            </h2>
          </div>
          <div className={styles.progressList}>
            {componentStats.filter(s => s.value > 0).map((item, i) => {
              const maxVal = Math.max(item.value, 50);
              const pct = Math.min(Math.round((item.value / maxVal) * 100), 100);
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
                  <span className={styles.progressRowCount}>{item.value}</span>
                </div>
              );
            })}
          </div>
        </section>
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
