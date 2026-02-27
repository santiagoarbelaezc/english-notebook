import React, { useState, useEffect, useCallback } from 'react';
import {
  Target, CheckCircle2, Clock, BookOpen, Headphones,
  MessageCircle, Plus, X, Edit2, Trash2, Search,
  Check, AlertCircle, Save, Flame, TrendingUp,
  Calendar, Minus, Music, PenTool, Zap,
} from 'lucide-react';
import huskyVideo from '../../assets/videos/video-husky5.mp4';
import styles from './DailyCommitments.module.css';
import {
  getAllCommitments,
  createCommitment,
  updateCommitment,
  deleteCommitment,
  updateCommitmentProgress,
  updateCommitmentStatus,
  getCommitmentStats,
} from '../../api/dailyCommitments.api';
import type {
  DailyCommitment,
  CommitmentType,
  CommitmentUnit,
  CommitmentFrequency,
  CommitmentStatus,
  CreateCommitmentRequest,
  UpdateCommitmentRequest,
} from '../../types';

// ── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<CommitmentType, string> = {
  'learn-words': 'Learn Words',
  'study-grammar': 'Study Grammar',
  'practice-conversation': 'Conversation',
  'read-text': 'Read Text',
  'listen-song': 'Listen Song',
  'custom': 'Custom',
};

const TYPE_ICONS: Record<CommitmentType, React.ReactNode> = {
  'learn-words': <BookOpen size={16} />,
  'study-grammar': <PenTool size={16} />,
  'practice-conversation': <MessageCircle size={16} />,
  'read-text': <BookOpen size={16} />,
  'listen-song': <Music size={16} />,
  'custom': <Zap size={16} />,
};

const UNIT_LABELS: Record<CommitmentUnit, string> = {
  'palabras': 'Words',
  'minutos': 'Minutes',
  'reglas': 'Rules',
  'oraciones': 'Sentences',
  'líneas': 'Lines',
  'custom': 'Custom',
};

const FREQUENCY_LABELS: Record<CommitmentFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const STATUS_LABELS: Record<CommitmentStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

// ── Main Component ───────────────────────────────────────────────────────────

const DailyCommitments: React.FC = () => {
  const [commitments, setCommitments] = useState<DailyCommitment[]>([]);
  const [filteredCommitments, setFilteredCommitments] = useState<DailyCommitment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<DailyCommitment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Data Loading ─────────────────────────────────────────────────────────

  const loadCommitments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, statsRes] = await Promise.all([
        getAllCommitments(),
        getCommitmentStats(),
      ]);
      setCommitments(res.commitments);
      setStats(statsRes.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load commitments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCommitments(); }, [loadCommitments]);

  // ── Filtering ─────────────────────────────────────────────────────────────

  useEffect(() => {
    let filtered = [...commitments];
    const q = searchTerm.toLowerCase();

    if (q) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    if (selectedType !== 'all') filtered = filtered.filter(c => c.type === selectedType);
    if (selectedStatus !== 'all') filtered = filtered.filter(c => c.status === selectedStatus);

    setFilteredCommitments(filtered);
  }, [commitments, searchTerm, selectedType, selectedStatus]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleCreate = async (data: CreateCommitmentRequest) => {
    try {
      setIsSubmitting(true);
      await createCommitment(data);
      showToast('Commitment created! 🎯');
      setShowCreateForm(false);
      await loadCommitments();
    } catch (err: any) {
      showToast(err.message || 'Failed to create commitment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, data: UpdateCommitmentRequest) => {
    try {
      setIsSubmitting(true);
      await updateCommitment(id, data);
      showToast('Commitment updated!');
      setEditingCommitment(null);
      await loadCommitments();
    } catch (err: any) {
      showToast(err.message || 'Failed to update', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this commitment?')) return;
    try {
      await deleteCommitment(id);
      showToast('Commitment deleted');
      await loadCommitments();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const handleProgressUpdate = async (id: string, current: number, goalValue: number) => {
    const clamped = Math.min(Math.max(current, 0), goalValue);
    try {
      await updateCommitmentProgress(id, { current: clamped });
      setCommitments(prev =>
        prev.map(c => c._id === id
          ? { ...c, progress: { current: clamped, percentage: Math.round((clamped / goalValue) * 100) } }
          : c
        )
      );
      if (clamped >= goalValue) showToast('Commitment completed! 🎉');
    } catch (err: any) {
      showToast('Failed to update progress', 'error');
    }
  };

  const handleStatusChange = async (id: string, status: CommitmentStatus) => {
    try {
      await updateCommitmentStatus(id, { status });
      setCommitments(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      showToast(`Status → ${STATUS_LABELS[status]}`);
    } catch (err: any) {
      showToast('Failed to update status', 'error');
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getStatusStyle = (status: CommitmentStatus) => {
    switch (status) {
      case 'completed': return styles.statusCompleted;
      case 'in-progress': return styles.statusInProgress;
      default: return styles.statusPending;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading && commitments.length === 0) {
    return (
      <div className={styles.pageContent}>
        <div className={styles.loading}>
          <Target size={40} className={styles.loadingIcon} />
          <p>Loading commitments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Daily Commitments</h1>
          <p className={styles.subtitle}>Track and achieve your daily English learning goals</p>
          <p className={styles.description}>
            Set personal goals, track your progress daily, and build consistency
            in your English learning journey. Every commitment counts.
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
            <Target size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total</p>
            <span className={styles.statValue}>{stats?.totalCommitments ?? commitments.length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <CheckCircle2 size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Completed</p>
            <span className={styles.statValue}>{stats?.completed ?? commitments.filter(c => c.status === 'completed').length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Flame size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>In Progress</p>
            <span className={styles.statValue}>{stats?.inProgress ?? commitments.filter(c => c.status === 'in-progress').length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #a8edea 0%, #00d4ff 100%)' }}>
            <TrendingUp size={26} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Completion Rate</p>
            <span className={styles.statValue}>{stats?.completionRate ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search commitments..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className={styles.filterSelect}>
            <option value="all">All Types</option>
            {(Object.keys(TYPE_LABELS) as CommitmentType[]).map(k => (
              <option key={k} value={k}>{TYPE_LABELS[k]}</option>
            ))}
          </select>
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className={styles.filterSelect}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button className={styles.createButton} onClick={() => setShowCreateForm(true)}>
          <Plus size={20} /> Add Commitment
        </button>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* ── RESULTS INFO ── */}
      {commitments.length > 0 && (
        <div className={styles.resultsInfo}>
          <span className={styles.resultsCount}>
            Showing {filteredCommitments.length} of {commitments.length} commitments
          </span>
        </div>
      )}

      {/* ── GRID ── */}
      {filteredCommitments.length === 0 && !loading ? (
        <div className={styles.emptyState}>
          <Target size={48} style={{ opacity: 0.25, marginBottom: '1rem' }} />
          <p>{commitments.length === 0 ? 'No commitments yet. Create your first one!' : 'No commitments match your filters.'}</p>
          {commitments.length > 0 && (
            <button className={styles.clearFiltersBtn} onClick={() => { setSearchTerm(''); setSelectedType('all'); setSelectedStatus('all'); }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.commitmentsGrid}>
          {filteredCommitments.map(commitment => {
            const pct = commitment.progress.percentage;
            const isDone = commitment.status === 'completed' || pct === 100;
            return (
              <div key={commitment._id} className={`${styles.commitmentCard} ${isDone ? styles.cardComplete : ''}`}>

                {/* Card Top */}
                <div className={styles.cardTop}>
                  <div className={styles.cardTopLeft}>
                    <span className={styles.typeBadge}>
                      {TYPE_ICONS[commitment.type]} {TYPE_LABELS[commitment.type]}
                    </span>
                    <span className={styles.freqBadge}>
                      <Calendar size={12} /> {FREQUENCY_LABELS[commitment.frequency]}
                    </span>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={`${styles.iconBtn} ${styles.iconBtnEdit}`} onClick={() => setEditingCommitment(commitment)} title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button className={`${styles.iconBtn} ${styles.iconBtnDelete}`} onClick={() => handleDelete(commitment._id)} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className={styles.cardBody}>
                  <h3 className={styles.commitmentTitle}>{commitment.title}</h3>
                  {commitment.description && (
                    <p className={styles.commitmentDesc}>{commitment.description}</p>
                  )}
                </div>

                {/* Progress */}
                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>
                      {commitment.progress.current} / {commitment.goal.value} {UNIT_LABELS[commitment.goal.unit]}
                    </span>
                    <span className={`${styles.progressPct} ${isDone ? styles.progressPctDone : ''}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={`${styles.progressFill} ${isDone ? styles.progressFillDone : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {/* +/- buttons */}
                  {!isDone && (
                    <div className={styles.progressControls}>
                      <button
                        className={styles.adjustBtn}
                        onClick={() => handleProgressUpdate(commitment._id, commitment.progress.current - 1, commitment.goal.value)}
                        disabled={commitment.progress.current <= 0}
                      >
                        <Minus size={14} />
                      </button>
                      <span className={styles.currentVal}>{commitment.progress.current}</span>
                      <button
                        className={styles.adjustBtn}
                        onClick={() => handleProgressUpdate(commitment._id, commitment.progress.current + 1, commitment.goal.value)}
                        disabled={commitment.progress.current >= commitment.goal.value}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Status selector */}
                <div className={styles.cardFooter}>
                  <div className={styles.statusSelector}>
                    {(['pending', 'in-progress', 'completed'] as CommitmentStatus[]).map(s => (
                      <button
                        key={s}
                        className={`${styles.statusBtn} ${commitment.status === s ? getStatusStyle(s) : ''}`}
                        onClick={() => handleStatusChange(commitment._id, s)}
                      >
                        {s === 'completed' && <CheckCircle2 size={12} />}
                        {s === 'in-progress' && <Clock size={12} />}
                        {s === 'pending' && <Target size={12} />}
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                  {commitment.notes && (
                    <p className={styles.cardNotes}>📝 {commitment.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      {showCreateForm && (
        <CommitmentFormModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreate}
          title="Add Commitment"
          isLoading={isSubmitting}
        />
      )}

      {/* ── EDIT MODAL ── */}
      {editingCommitment && (
        <CommitmentFormModal
          commitment={editingCommitment}
          onClose={() => setEditingCommitment(null)}
          onSubmit={(data) => handleUpdate(editingCommitment._id, data)}
          title="Edit Commitment"
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

// ── Commitment Form Modal ────────────────────────────────────────────────────

interface CommitmentFormModalProps {
  commitment?: DailyCommitment;
  onClose: () => void;
  onSubmit: (data: CreateCommitmentRequest) => Promise<void>;
  title: string;
  isLoading?: boolean;
}

const EMPTY_FORM: CreateCommitmentRequest = {
  title: '',
  description: '',
  type: 'custom',
  goal: { value: 10, unit: 'minutos' },
  reminder: { enabled: true, time: '08:00' },
  frequency: 'daily',
  notes: '',
};

const CommitmentFormModal: React.FC<CommitmentFormModalProps> = ({
  commitment, onClose, onSubmit, title, isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateCommitmentRequest>(EMPTY_FORM);

  useEffect(() => {
    if (commitment) {
      setFormData({
        title: commitment.title,
        description: commitment.description || '',
        type: commitment.type,
        goal: { value: commitment.goal.value, unit: commitment.goal.unit },
        reminder: commitment.reminder || { enabled: true },
        frequency: commitment.frequency,
        notes: commitment.notes || '',
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [commitment]);

  const set = (field: keyof CreateCommitmentRequest, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h2>
            {commitment ? <Edit2 size={22} /> : <Plus size={22} />}
            {title}
          </h2>
          <button className={styles.closeButton} onClick={onClose}><X size={22} /></button>
        </header>

        <form onSubmit={handleSubmit} className={styles.modalForm}>

          {/* Title + Type */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => set('title', e.target.value)}
                required
                placeholder="e.g., Learn 10 new words"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Type *</label>
              <select value={formData.type} onChange={e => set('type', e.target.value as CommitmentType)}>
                {(Object.entries(TYPE_LABELS) as [CommitmentType, string][]).map(([k, v]) => (
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
              placeholder="What does this commitment involve?"
            />
          </div>

          {/* Goal: value + unit */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Goal Value *</label>
              <input
                type="number"
                min={1}
                value={formData.goal.value}
                onChange={e => set('goal', { ...formData.goal, value: Number(e.target.value) })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Goal Unit *</label>
              <select
                value={formData.goal.unit}
                onChange={e => set('goal', { ...formData.goal, unit: e.target.value as CommitmentUnit })}
              >
                {(Object.entries(UNIT_LABELS) as [CommitmentUnit, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Frequency + Reminder */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Frequency</label>
              <select value={formData.frequency} onChange={e => set('frequency', e.target.value as CommitmentFrequency)}>
                {(Object.entries(FREQUENCY_LABELS) as [CommitmentFrequency, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Reminder Time <span className={styles.optional}>(optional)</span></label>
              <input
                type="time"
                value={formData.reminder?.time || '08:00'}
                onChange={e => set('reminder', { enabled: true, time: e.target.value })}
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
              placeholder="Personal notes..."
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Saving...' : <><Save size={16} /> {commitment ? 'Update' : 'Create'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyCommitments;