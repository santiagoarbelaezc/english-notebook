import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Target, Flame, BookOpen, Mic2, PenTool,
  Star, CheckCircle2, Calendar, Award, Plus, X, Edit2,
  Trash2, Search, Check, AlertCircle, Save, Zap, TrendingUp,
} from 'lucide-react';
import huskyVideo from '../../assets/videos/video-husky14.mp4';
import styles from './Achievements.module.css';
import {
  getAllAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  updateAchievementProgress,
  getAchievementStats,
} from '../../api/achievements.api';
import type {
  Achievement,
  AchievementType,
  CreateAchievementRequest,
  UpdateAchievementRequest,
} from '../../types';

// ── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<AchievementType, string> = {
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  conversation: 'Conversation',
  reading: 'Reading',
  milestone: 'Milestone',
  streak: 'Streak',
  custom: 'Custom',
};

const TYPE_ICONS: Record<AchievementType, React.ReactNode> = {
  vocabulary: <Target size={16} />,
  grammar: <PenTool size={16} />,
  conversation: <Mic2 size={16} />,
  reading: <BookOpen size={16} />,
  milestone: <Zap size={16} />,
  streak: <Flame size={16} />,
  custom: <Star size={16} />,
};

const TYPE_COLORS: Record<AchievementType, string> = {
  vocabulary: styles.typeVocabulary,
  grammar: styles.typeGrammar,
  conversation: styles.typeConversation,
  reading: styles.typeReading,
  milestone: styles.typeMilestone,
  streak: styles.typeStreak,
  custom: styles.typeCustom,
};

const POPULAR_ICONS = ['🏆', '⭐', '🎯', '🔥', '📚', '💬', '🎖️', '👑', '💡', '🚀', '🌟', '✨', '📖', '🃏', '🧠'];

// ── Main Component ───────────────────────────────────────────────────────────

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showCompleted, setShowCompleted] = useState<'all' | 'done' | 'pending'>('all');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Data Loading ─────────────────────────────────────────────────────────

  const loadAchievements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, statsRes] = await Promise.all([
        getAllAchievements(),
        getAchievementStats(),
      ]);
      setAchievements(res.achievements);
      setStats(statsRes.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAchievements(); }, [loadAchievements]);

  // ── Filtering ─────────────────────────────────────────────────────────────

  useEffect(() => {
    let filtered = [...achievements];
    const q = searchTerm.toLowerCase();

    if (q) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }
    if (selectedType !== 'all') filtered = filtered.filter(a => a.type === selectedType);
    if (showCompleted === 'done') filtered = filtered.filter(a => a.progress === 100);
    if (showCompleted === 'pending') filtered = filtered.filter(a => a.progress < 100);

    setFilteredAchievements(filtered);
  }, [achievements, searchTerm, selectedType, showCompleted]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleCreate = async (data: CreateAchievementRequest) => {
    try {
      setIsSubmitting(true);
      await createAchievement(data);
      showToast('Achievement created! 🏆');
      setShowCreateForm(false);
      await loadAchievements();
    } catch (err: any) {
      showToast(err.message || 'Failed to create achievement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, data: UpdateAchievementRequest) => {
    try {
      setIsSubmitting(true);
      await updateAchievement(id, data);
      showToast('Achievement updated!');
      setEditingAchievement(null);
      await loadAchievements();
    } catch (err: any) {
      showToast(err.message || 'Failed to update achievement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await deleteAchievement(id);
      showToast('Achievement deleted');
      await loadAchievements();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const handleProgressUpdate = async (id: string, progress: number) => {
    try {
      await updateAchievementProgress(id, { progress });
      setAchievements(prev =>
        prev.map(a => a._id === id ? { ...a, progress } : a)
      );
      if (progress === 100) showToast('Achievement completed! 🎉');
    } catch (err: any) {
      showToast('Failed to update progress', 'error');
    }
  };

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
    <div className={styles.pageContent}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Achievements</h1>
          <p className={styles.subtitle}>Track your progress and unlock rewards as you master English</p>
          <p className={styles.description}>
            Every milestone counts. Create personal achievements, track your progress,
            and celebrate your learning journey one step at a time.
          </p>
        </div>
        <div className={styles.huskyContainer}>
          <video
            className={styles.huskyVideo}
            src={huskyVideo}
            autoPlay loop muted playsInline
          />
        </div>
      </header>

      {/* ── STATS ── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Trophy size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total</p>
            <span className={styles.statValue}>{stats?.totalAchievements ?? achievements.length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <CheckCircle2 size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Completed</p>
            <span className={styles.statValue}>{stats?.completedAchievements ?? achievements.filter(a => a.progress === 100).length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Award size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Points</p>
            <span className={styles.statValue}>{stats?.totalPoints ?? achievements.reduce((s, a) => s + a.points, 0)}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #a8edea 0%, #00d4ff 100%)' }}>
            <TrendingUp size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Avg Progress</p>
            <span className={styles.statValue}>{stats?.averageProgress ? `${Math.round(Number(stats.averageProgress))}%` : '—'}</span>
          </div>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className={styles.filterSelect}>
            <option value="all">All Types</option>
            {(Object.keys(TYPE_LABELS) as AchievementType[]).map(k => (
              <option key={k} value={k}>{TYPE_LABELS[k]}</option>
            ))}
          </select>
          <select value={showCompleted} onChange={e => setShowCompleted(e.target.value as any)} className={styles.filterSelect}>
            <option value="all">All Status</option>
            <option value="done">Completed</option>
            <option value="pending">In Progress</option>
          </select>
        </div>
        <button className={styles.createButton} onClick={() => setShowCreateForm(true)}>
          <Plus size={20} /> Add Achievement
        </button>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* ── RESULTS INFO ── */}
      {achievements.length > 0 && (
        <div className={styles.resultsInfo}>
          <span className={styles.resultsCount}>
            Showing {filteredAchievements.length} of {achievements.length} achievements
          </span>
        </div>
      )}

      {/* ── GRID ── */}
      {filteredAchievements.length === 0 && !loading ? (
        <div className={styles.emptyState}>
          <Trophy size={48} style={{ opacity: 0.25, marginBottom: '1rem' }} />
          <p>{achievements.length === 0 ? 'No achievements yet. Create your first one!' : 'No achievements match your filters.'}</p>
          {achievements.length > 0 && (
            <button className={styles.clearFiltersBtn} onClick={() => { setSearchTerm(''); setSelectedType('all'); setShowCompleted('all'); }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.achievementsGrid}>
          {filteredAchievements.map(achievement => {
            const isComplete = achievement.progress === 100;
            return (
              <div
                key={achievement._id}
                className={`${styles.achievementCard} ${isComplete ? styles.cardComplete : ''}`}
              >
                {/* Card Header */}
                <div className={styles.cardTop}>
                  <div className={styles.iconWrapper}>
                    <span className={styles.emojiIcon}>{achievement.icon || '🏆'}</span>
                    {isComplete && <span className={styles.completedRing} />}
                  </div>
                  <div className={styles.cardTopRight}>
                    <span className={`${styles.typeBadge} ${TYPE_COLORS[achievement.type]}`}>
                      {TYPE_ICONS[achievement.type]} {TYPE_LABELS[achievement.type]}
                    </span>
                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
                        onClick={() => setEditingAchievement(achievement)}
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                        onClick={() => handleDelete(achievement._id)}
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className={styles.cardBody}>
                  <h3 className={styles.achievementTitle}>{achievement.title}</h3>
                  {achievement.description && (
                    <p className={styles.achievementDesc}>{achievement.description}</p>
                  )}
                  {achievement.notes && (
                    <p className={styles.achievementNotes}>📝 {achievement.notes}</p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Progress</span>
                    <span className={`${styles.progressPct} ${isComplete ? styles.progressPctDone : ''}`}>
                      {achievement.progress}%
                    </span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={`${styles.progressFill} ${isComplete ? styles.progressFillDone : ''}`}
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  {/* Quick progress buttons */}
                  {!isComplete && (
                    <div className={styles.progressBtns}>
                      {[25, 50, 75, 100].map(pct => (
                        <button
                          key={pct}
                          className={`${styles.progressQuickBtn} ${achievement.progress >= pct ? styles.progressQuickBtnActive : ''}`}
                          onClick={() => handleProgressUpdate(achievement._id, pct)}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className={styles.cardFooter}>
                  <div className={styles.footerLeft}>
                    <span className={styles.pointsBadge}>
                      <Award size={14} /> {achievement.points} pts
                    </span>
                    {achievement.details?.value !== undefined && (
                      <span className={styles.detailsBadge}>
                        {achievement.details.value}
                        {achievement.details.target ? ` / ${achievement.details.target}` : ''}
                        {achievement.details.unit ? ` ${achievement.details.unit}` : ''}
                      </span>
                    )}
                  </div>
                  {isComplete ? (
                    <span className={styles.completedBadge}>
                      <CheckCircle2 size={13} /> Completed
                    </span>
                  ) : (
                    <span className={styles.pendingBadge}>
                      <Calendar size={13} />
                      {new Date(achievement.unlockedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      {showCreateForm && (
        <AchievementFormModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreate}
          title="Add New Achievement"
          isLoading={isSubmitting}
        />
      )}

      {/* ── EDIT MODAL ── */}
      {editingAchievement && (
        <AchievementFormModal
          achievement={editingAchievement}
          onClose={() => setEditingAchievement(null)}
          onSubmit={(data) => handleUpdate(editingAchievement._id, data)}
          title="Edit Achievement"
          isLoading={isSubmitting}
        />
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

// ── Achievement Form Modal ───────────────────────────────────────────────────

interface AchievementFormModalProps {
  achievement?: Achievement;
  onClose: () => void;
  onSubmit: (data: CreateAchievementRequest) => Promise<void>;
  title: string;
  isLoading?: boolean;
}

const EMPTY_FORM: CreateAchievementRequest = {
  title: '',
  description: '',
  type: 'custom',
  icon: '🏆',
  progress: 0,
  points: 10,
  notes: '',
  details: {},
};

const AchievementFormModal: React.FC<AchievementFormModalProps> = ({
  achievement, onClose, onSubmit, title, isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateAchievementRequest>(EMPTY_FORM);

  useEffect(() => {
    if (achievement) {
      setFormData({
        title: achievement.title,
        description: achievement.description || '',
        type: achievement.type,
        icon: achievement.icon || '🏆',
        progress: achievement.progress,
        points: achievement.points,
        notes: achievement.notes || '',
        details: achievement.details || {},
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [achievement]);

  const set = (field: keyof CreateAchievementRequest, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const setDetail = (field: keyof NonNullable<CreateAchievementRequest['details']>, value: any) =>
    setFormData(prev => ({ ...prev, details: { ...prev.details, [field]: value || undefined } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h2>
            {achievement ? <Edit2 size={22} /> : <Plus size={22} />}
            {title}
          </h2>
          <button className={styles.closeButton} onClick={onClose}><X size={22} /></button>
        </header>

        <form onSubmit={handleSubmit} className={styles.modalForm}>

          {/* Icon picker */}
          <div className={styles.formGroup}>
            <label>Icon</label>
            <div className={styles.iconPicker}>
              {POPULAR_ICONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`${styles.iconOption} ${formData.icon === emoji ? styles.iconOptionActive : ''}`}
                  onClick={() => set('icon', emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Row: Title + Type */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => set('title', e.target.value)}
                required
                placeholder="e.g., Vocabulary Master"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Type *</label>
              <select value={formData.type} onChange={e => set('type', e.target.value as AchievementType)}>
                {(Object.entries(TYPE_LABELS) as [AchievementType, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label>Description <span className={styles.optional}>(optional)</span></label>
            <textarea
              value={formData.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
              placeholder="What is this achievement about?"
            />
          </div>

          {/* Row: Progress + Points */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Progress (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.progress}
                onChange={e => set('progress', Number(e.target.value))}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Points</label>
              <input
                type="number"
                min={0}
                value={formData.points}
                onChange={e => set('points', Number(e.target.value))}
              />
            </div>
          </div>

          {/* Details */}
          <div className={styles.formGroup}>
            <label>Details <span className={styles.optional}>(optional)</span></label>
            <div className={styles.formRow}>
              <input
                type="number"
                placeholder="Value (e.g. 50)"
                value={formData.details?.value ?? ''}
                onChange={e => setDetail('value', e.target.value ? Number(e.target.value) : undefined)}
              />
              <input
                type="number"
                placeholder="Target (e.g. 100)"
                value={formData.details?.target ?? ''}
                onChange={e => setDetail('target', e.target.value ? Number(e.target.value) : undefined)}
              />
              <input
                type="text"
                placeholder="Unit (e.g. words)"
                value={formData.details?.unit ?? ''}
                onChange={e => setDetail('unit', e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className={styles.formGroup}>
            <label>Notes <span className={styles.optional}>(optional)</span></label>
            <textarea
              value={formData.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              placeholder="Personal notes about this achievement..."
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Saving...' : <><Save size={16} /> {achievement ? 'Update' : 'Create'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Achievements;
