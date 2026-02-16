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
      <div className={styles.profileContainer}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>My Profile</h2>
          <p className={styles.formSubtitle}>Manage your personal information and review your progress</p>
        </div>

        {error && <div className={styles.globalError}>{error}</div>}

        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
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
            <div className={styles.profileInfo}>
              {isEditing ? (
                <div className={styles.editForm}>
                  <div className={styles.inputGroup}>
                    <User size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your name"
                      className={styles.editInput}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <Edit2 size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      value={editForm.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Biography"
                      className={styles.editInput}
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
                  <h2 className={styles.profileName}>
                    {profile.user?.name || profile.user?.username || 'User'}
                  </h2>
                  <div className={styles.profileDetailRow}>
                    <Mail size={16} className={styles.detailIcon} />
                    <p className={styles.profileEmail}>{profile.user?.email}</p>
                  </div>
                  {profile.bio && <p className={styles.profileBio}>{profile.bio}</p>}
                  {profile.nativeLanguage && (
                    <div className={styles.profileLanguage}>
                      <Globe size={16} className={styles.detailIcon} />
                      <span>Native Language: {profile.nativeLanguage}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={styles.profileStats}>
            <div className={styles.profileStatItem}>
              <span className={styles.statLabel}>Current Level</span>
              <span
                className={styles.statValue}
                style={{ color: getLevelColor(isEditing ? editForm.englishLevel : summary.user.englishLevel) }}
              >
                {isEditing ? editForm.englishLevel || 'Not defined' : summary.user.englishLevel || 'Not defined'}
              </span>
            </div>
            <div className={styles.profileStatItem}>
              <span className={styles.statLabel}>Current Streak</span>
              <div className={styles.statValueRow}>
                <TrendingUp size={24} color="#00d4ff" />
                <span className={styles.statValue}>{stats.overview?.streakDays || 0} days</span>
              </div>
            </div>
            <div className={styles.profileStatItem}>
              <span className={styles.statLabel}>Total Points</span>
              <div className={styles.statValueRow}>
                <Star size={24} color="#ffd700" />
                <span className={styles.statValue}>
                  {(stats.overview?.totalVocabulary || 0) +
                    (stats.overview?.totalGrammarRules || 0) +
                    (stats.overview?.totalConversations || 0) +
                    (stats.overview?.totalSongs || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.detailedStats}>
            <h3 className={styles.statsTitle}>Detailed Statistics</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <BookOpen size={28} className={styles.statIcon} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statNumber}>{stats.overview?.totalVocabulary || 0}</span>
                  <span className={styles.statDesc}>Words Learned</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <PenTool size={28} className={styles.statIcon} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statNumber}>{stats.overview?.totalGrammarRules || 0}</span>
                  <span className={styles.statDesc}>Grammar Rules</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <MessageSquare size={28} className={styles.statIcon} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statNumber}>{stats.overview?.totalConversations || 0}</span>
                  <span className={styles.statDesc}>Conversations</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <Music size={28} className={styles.statIcon} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statNumber}>{stats.overview?.totalSongs || 0}</span>
                  <span className={styles.statDesc}>Songs Listened</span>
                </div>
              </div>
            </div>
          </div>

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
                  View Full Progress
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;