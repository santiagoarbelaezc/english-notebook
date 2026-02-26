import { useState, useEffect } from 'react';
import {
  BookOpen,
  PenTool,
  MessageSquare,
  Music,
  Camera,
  User,
  Mail,
  Globe,
  Award,
  TrendingUp,
  Star,
  Edit2
} from 'lucide-react';
import styles from './Profile.module.css';
import { getMyProfile, getProfileSummary, getDetailedStats, updateProfile, uploadProfileImage } from '../../api/profiles.api';
import { updateUserProfile } from '../../api/users.api';
import type { Profile as ProfileData, ProfileSummary, DetailedStats } from '../../api/profiles.api';
import type { UpdateUserData } from '../../types/user.types';
import { useAuth } from '../../contexts/AuthContext';

export const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    nativeLanguage: '',
    englishLevel: ''
  });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileData, summaryData, statsData] = await Promise.all([
          getMyProfile(),
          getProfileSummary(),
          getDetailedStats()
        ]);

        console.log('Profile data received:', { profileData, summaryData, statsData });
        setProfile(profileData);
        setSummary(summaryData);
        setStats(statsData);

        if (profileData && profileData.user) {
          setEditForm({
            name: profileData.user.name || '',
            bio: profileData.bio || '',
            nativeLanguage: profileData.nativeLanguage || '',
            englishLevel: profileData.user.englishLevel || ''
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Error loading profile. Check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfileData();
    }
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData: UpdateUserData = {
        name: editForm.name,
        englishLevel: editForm.englishLevel as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
      };

      const profileData = {
        bio: editForm.bio,
        nativeLanguage: editForm.nativeLanguage
      };

      const [userResponse, profileResponse] = await Promise.all([
        updateUserProfile(userData),
        updateProfile(profileData)
      ]);

      console.log('Profile updated successfully:', { userResponse, profileResponse });

      if (profile) {
        setProfile({
          ...profile,
          user: {
            ...profile.user,
            name: editForm.name,
            englishLevel: editForm.englishLevel
          },
          bio: editForm.bio,
          nativeLanguage: editForm.nativeLanguage
        });
      }

      if (summary) {
        setSummary({
          ...summary,
          user: {
            ...summary.user,
            name: editForm.name,
            englishLevel: editForm.englishLevel,
            bio: editForm.bio
          }
        });
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error updating profile. Please try again.');
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
      setProfile(prev => prev ? {
        ...prev,
        profileImage: result.profileImage
      } : null);
      setError(null);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error uploading image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level?: string) => {
    if (!level) return '#00d4ff';
    switch (level.toUpperCase()) {
      case 'A1': return '#00d4ff';
      case 'A2': return '#00d4ff';
      case 'B1': return '#007bff';
      case 'B2': return '#007bff';
      case 'C1': return '#0056b3';
      case 'C2': return '#0056b3';
      default: return '#00d4ff';
    }
  };

  if (loading && !profile) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingCard}>
            <div className={styles.spinner}></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !summary || !stats) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <p>No profile data could be loaded</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>
      {error && <div className={styles.globalError}>{error}</div>}

      <header className={styles.header}>
        <div className={styles.profileAvatar}>
          {profile.profileImage ? (
            <img src={profile.profileImage} alt="Profile picture" className={styles.avatarImage} />
          ) : (
            <span className={styles.avatarPlaceholder}>
              {profile.user?.name?.[0] || profile.user?.username?.[0]?.toUpperCase() || '?'}
            </span>
          )}
          {isEditing && (
            <label className={styles.imageUpload}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <Camera size={20} color="#fff" />
            </label>
          )}
        </div>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            {isEditing ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your name"
                className={styles.editInput}
                style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}
              />
            ) : (
              profile.user?.name || profile.user?.username || 'User'
            )}
          </h1>
          <p className={styles.subtitle}>{profile.user?.email}</p>
        </div>
      </header>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: getLevelColor(isEditing ? editForm.englishLevel : summary.user.englishLevel) }}>
            <Award size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>
              {isEditing ? editForm.englishLevel || 'N/A' : summary.user.englishLevel || 'N/A'}
            </span>
            <span className={styles.statLabel}>English Level</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--gradient-warning)' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{stats.overview?.streakDays || 0}</span>
            <span className={styles.statLabel}>Day Streak</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--gradient-accent)' }}>
            <Star size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>
              {(stats.overview?.totalVocabulary || 0) +
                (stats.overview?.totalGrammarRules || 0) +
                (stats.overview?.totalConversations || 0) +
                (stats.overview?.totalSongs || 0)}
            </span>
            <span className={styles.statLabel}>Total Points</span>
          </div>
        </div>
      </section>

      <section className={styles.profileDetailsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <User size={28} color="#00d4ff" />
            Personal Details
          </h2>
        </div>

        <div className={styles.detailsGrid}>
          {isEditing ? (
            <div className={styles.editContainer}>
              <div className={styles.inputGroup}>
                <Edit2 size={18} className={styles.inputIcon} />
                <textarea
                  value={editForm.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  className={styles.editInput}
                  style={{ minHeight: '100px', resize: 'vertical' }}
                />
              </div>
              <div className={styles.inputGroup}>
                <Award size={18} className={styles.inputIcon} />
                <select
                  value={editForm.englishLevel}
                  onChange={(e) => handleInputChange('englishLevel', e.target.value)}
                  className={styles.editSelect}
                >
                  <option value="">Select your level</option>
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Mastery</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <Globe size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  value={editForm.nativeLanguage}
                  onChange={(e) => handleInputChange('nativeLanguage', e.target.value)}
                  placeholder="Native language"
                  className={styles.editInput}
                />
              </div>
            </div>
          ) : (
            <>
              <div className={`${styles.detailCard} ${styles.bioCard}`}>
                <span className={styles.detailLabel}>
                  <Edit2 size={16} />
                  Biography
                </span>
                <p className={`${styles.detailValue} ${styles.bioValue}`}>
                  {profile.bio || "No biography provided yet. Tell the world about your learning journey!"}
                </p>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>
                  <Globe size={16} />
                  Native Language
                </span>
                <p className={styles.detailValue}>{profile.nativeLanguage || 'Not specified'}</p>
              </div>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>
                  <Mail size={16} />
                  Email Address
                </span>
                <p className={styles.detailValue}>{profile.user?.email}</p>
              </div>
            </>
          )}
        </div>
      </section>

      <section className={styles.profileDetailsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <TrendingUp size={28} color="#43e97b" />
            Learning Progress
          </h2>
        </div>
        <div className={styles.detailsGrid}>
          <div className={styles.detailCard}>
            <span className={styles.detailLabel}>
              <BookOpen size={16} />
              Vocabulary
            </span>
            <p className={styles.detailValue}>{stats.overview?.totalVocabulary || 0} Words Learned</p>
          </div>
          <div className={styles.detailCard}>
            <span className={styles.detailLabel}>
              <PenTool size={16} />
              Grammar
            </span>
            <p className={styles.detailValue}>{stats.overview?.totalGrammarRules || 0} Rules Mastered</p>
          </div>
          <div className={styles.detailCard}>
            <span className={styles.detailLabel}>
              <MessageSquare size={16} />
              Conversations
            </span>
            <p className={styles.detailValue}>{stats.overview?.totalConversations || 0} Completed</p>
          </div>
          <div className={styles.detailCard}>
            <span className={styles.detailLabel}>
              <Music size={16} />
              Music
            </span>
            <p className={styles.detailValue}>{stats.overview?.totalSongs || 0} Songs Listened</p>
          </div>
        </div>
      </section>

      <div className={styles.actions}>
        {isEditing ? (
          <>
            <button
              onClick={handleSaveProfile}
              className={styles.primaryButton}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleEditToggle}
              className={styles.secondaryButton}
              disabled={loading}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={handleEditToggle} className={styles.primaryButton}>
              Edit Profile
            </button>
            <button className={styles.secondaryButton}>
              Export Progress
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
