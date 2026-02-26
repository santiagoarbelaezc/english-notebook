import { useState, useEffect } from 'react';
import {
  BookOpen,
  Trophy,
  Files,
  CheckCircle,
  MessageCircle,
  Music,
  Calendar,
  Star,
  Target,
  Film,
  FileText,
  Book,
  Flame,
  Award
} from 'lucide-react';

import styles from './Dashboard.module.css';
import Profile from '../profile';
import IrregularVerbs from '../irregular-verbs';
import Grammar from '../grammar';
import Conversations from '../conversations';
import { getRandomPhrase } from '../../api/dailyPhrases.api';
import type { DailyPhrase } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import huskyVideo from '../../assets/videos/video-husky2.mp4';

export const Dashboard = () => {
  // @ts-ignore
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'flashcards':
        return <FlashcardsSection />;
      case 'vocabulary':
        return <VocabularySection />;
      case 'grammar':
        return <Grammar />;
      case 'conversations':
        return <Conversations />;
      case 'daily-phrases':
        return <DailyPhrasesSection />;
      case 'daily-commitments':
        return <DailyCommitmentsSection />;
      case 'irregular-verbs':
        return <IrregularVerbs />;
      case 'movies':
        return <MoviesSection />;
      case 'songs':
        return <SongsSection />;
      case 'texts':
        return <TextsSection />;
      case 'achievements':
        return <AchievementsSection />;
      case 'profile':
        return <Profile />;
      default:
        return <MainDashboardSection />;
    }
  };

  return (
    <div className={styles.pageContent}>
      {renderContent()}
    </div>
  );
};

interface DashboardFlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
}

const DashboardFlipCard = ({ frontContent, backContent, className = '' }: DashboardFlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`${styles.flipCardContainer} ${isFlipped ? styles.flipped : ''} ${className}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={styles.flipCardInner}>
        <div className={styles.flipCardFront}>
          {frontContent}
          <div className={styles.flipHint}>Click to flip ↻</div>
        </div>
        <div className={styles.flipCardBack}>
          {backContent}
          <div className={styles.flipHint}>Click to flip ↻</div>
        </div>
      </div>
    </div>
  );
};

/* Main Dashboard Section */
const MainDashboardSection = () => {
  const { user } = useAuth();

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Welcome Back, {(user?.name || user?.username || 'Learner').split(' ')[0]}!</h1>
          <p className={styles.subtitle}>Continue learning English in a fun and effective way</p>
          <p className={styles.description}>
            English Notebook is your premium personalized space for mastering English.
            Track your progress, learn new vocabulary through interactive flashcards,
            practice grammar, and immerse yourself in real conversations, movies, and songs.
          </p>
        </div>
        <div className={styles.huskyContainer}>
          <video
            src={huskyVideo}
            autoPlay
            loop
            muted
            playsInline
            className={styles.huskyVideo}
          />
        </div>
      </div>

      <div className={styles.statsGrid}>
        <DashboardFlipCard
          frontContent={
            <div className={styles.statCard}>
              <div className={styles.statIcon}><BookOpen size={28} /></div>
              <div className={styles.statContent}>
                <h3 className={styles.statLabel}>Words Learned</h3>
                <p className={styles.statValue}>245</p>
              </div>
            </div>
          }
          backContent={
            <div>
              <h3>Weekly Progress</h3>
              <span className={styles.highlight}>+12</span>
              <p>new words this week</p>
            </div>
          }
        />

        <DashboardFlipCard
          frontContent={
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Files size={28} /></div>
              <div className={styles.statContent}>
                <h3 className={styles.statLabel}>Flashcards</h3>
                <p className={styles.statValue}>89</p>
              </div>
            </div>
          }
          backContent={
            <div>
              <h3>Mastery Level</h3>
              <span className={styles.highlight}>85%</span>
              <p>of cards mastered</p>
            </div>
          }
        />

        <DashboardFlipCard
          frontContent={
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Trophy size={28} /></div>
              <div className={styles.statContent}>
                <h3 className={styles.statLabel}>Achievements</h3>
                <p className={styles.statValue}>12</p>
              </div>
            </div>
          }
          backContent={
            <div>
              <h3>Next Goal</h3>
              <p>Reach 10 day streak</p>
              <span className={styles.highlight}>2/10</span>
            </div>
          }
        />

        <DashboardFlipCard
          frontContent={
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Flame size={28} /></div>
              <div className={styles.statContent}>
                <h3 className={styles.statLabel}>Current Streak</h3>
                <p className={styles.statValue}>7 days</p>
              </div>
            </div>
          }
          backContent={
            <div>
              <h3>Best Streak</h3>
              <span className={styles.highlight}>15 days</span>
              <p>Keep it up!</p>
            </div>
          }
        />
      </div>

      <div className={styles.contentGrid}>
        <DashboardFlipCard
          frontContent={
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Recent Activity</h2>
                <span className={styles.badge}>Today</span>
              </div>
              <div className={styles.activityList}>
                <div className={styles.activityItem}>
                  <span className={styles.activityIcon}><CheckCircle size={20} color="#43e97b" /></span>
                  <div className={styles.activityContent}>
                    <p className={styles.activityTitle}>Completed 10 vocabulary flashcards</p>
                    <p className={styles.activityTime}>2 hours ago</p>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <span className={styles.activityIcon}><MessageCircle size={20} color="#667eea" /></span>
                  <div className={styles.activityContent}>
                    <p className={styles.activityTitle}>Practiced a conversation</p>
                    <p className={styles.activityTime}>5 hours ago</p>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <span className={styles.activityIcon}><Music size={20} color="#f093fb" /></span>
                  <div className={styles.activityContent}>
                    <p className={styles.activityTitle}>Listened to an English song</p>
                    <p className={styles.activityTime}>8 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          }
          backContent={
            <div>
              <h3>Activity History</h3>
              <div className={styles.activityList}>
                <div className={styles.activityItem}>
                  <span className={styles.activityIcon}><Calendar size={20} /></span>
                  <div className={styles.activityContent}>
                    <p className={styles.activityTitle}>View full history</p>
                    <p className={styles.activityTime}>Check your past progress</p>
                  </div>
                </div>
              </div>
            </div>
          }
        />

        <DashboardFlipCard
          frontContent={
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Daily Commitment</h2>
                <span className={styles.badge}>3/5</span>
              </div>
              <div className={styles.commitmentList}>
                <div className={styles.commitmentItem}>
                  <input type="checkbox" defaultChecked className={styles.checkbox} />
                  <span>Learn 10 new words</span>
                </div>
                <div className={styles.commitmentItem}>
                  <input type="checkbox" defaultChecked className={styles.checkbox} />
                  <span>Practice grammar</span>
                </div>
                <div className={styles.commitmentItem}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Listen to a conversation</span>
                </div>
                <div className={styles.commitmentItem}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Watch a movie</span>
                </div>
                <div className={styles.commitmentItem}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Write a text</span>
                </div>
              </div>
            </div>
          }
          backContent={
            <div>
              <h3>Weekly Completion</h3>
              <span className={styles.highlight}>82%</span>
              <p>completion rate this week</p>
              <div style={{ marginTop: '1rem', width: '100%', background: 'rgba(255,255,255,0.2)', height: '6px', borderRadius: '3px' }}>
                <div style={{ width: '82%', background: '#43e97b', height: '100%', borderRadius: '3px' }}></div>
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
};

/* Flashcards Section */
const FlashcardsSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}><Files size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Flashcards</h1>
      <p className={styles.subtitle}>Study and practice with interactive flashcards</p>
    </div>
    <div className={styles.emptyState}>
      <p>Create your first flashcards to start studying</p>
      <button className={styles.primaryButton}>+ Create Flashcard</button>
    </div>
  </section>
);

/* Vocabulary Section */
const VocabularySection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}><BookOpen size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Vocabulary</h1>
      <p className={styles.subtitle}>Expand your English vocabulary</p>
    </div>
    <div className={styles.emptyState}>
      <p>No words registered yet</p>
      <button className={styles.primaryButton}>+ Add Word</button>
    </div>
  </section>
);

/* Grammar Section */
/* Conversations Section */

/* Daily Phrases Section */
const DailyPhrasesSection = () => {
  const [dailyPhrase, setDailyPhrase] = useState<DailyPhrase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDailyPhrase = async () => {
      try {
        const response = await getRandomPhrase();
        setDailyPhrase(response.phrase);
      } catch (error) {
        // No phrases available, keep default
      } finally {
        setLoading(false);
      }
    };
    loadDailyPhrase();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h1 className={styles.title}><Star size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Daily Phrases</h1>
        <p className={styles.subtitle}>Learn a new phrase every day</p>
      </div>
      <div className={styles.card}>
        {loading ? (
          <p>Loading...</p>
        ) : dailyPhrase ? (
          <div className={styles.phraseCard}>
            <p className={styles.phraseText}>"{dailyPhrase.phrase}"</p>
            <p className={styles.phraseTranslation}>{dailyPhrase.translation}</p>
            <p className={styles.phraseExample}>Type: {dailyPhrase.type}</p>
          </div>
        ) : (
          <div className={styles.phraseCard}>
            <p className={styles.phraseText}>"The early bird catches the worm"</p>
            <p className={styles.phraseTranslation}>The early bird gets the worm</p>
            <p className={styles.phraseExample}>Example: If you want to get a good job, you have to be an early bird.</p>
          </div>
        )}
      </div>
    </section>
  );
};

/* Daily Commitments Section */
const DailyCommitmentsSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}><Target size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Daily Commitments</h1>
      <p className={styles.subtitle}>Maintain your learning streak</p>
    </div>
    <div className={styles.card}>
      <div className={styles.commitmentList}>
        <div className={styles.commitmentItem}>
          <input type="checkbox" defaultChecked className={styles.checkbox} />
          <span>Learn 10 new words</span>
        </div>
        <div className={styles.commitmentItem}>
          <input type="checkbox" className={styles.checkbox} />
          <span>Practice pronunciation (5 min)</span>
        </div>
        <div className={styles.commitmentItem}>
          <input type="checkbox" className={styles.checkbox} />
          <span>Complete grammar exercises</span>
        </div>
      </div>
    </div>
  </section>
);

/* Movies Section */
const MoviesSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}><Film size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Movies</h1>
      <p className={styles.subtitle}>Improve your English by watching movies</p>
    </div>
    <div className={styles.emptyState}>
      <p>Explore recommended movies</p>
      <button className={styles.primaryButton}>+ Watch Movies</button>
    </div>
  </section>
);

/* Songs Section */
const SongsSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}><Music size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Songs</h1>
      <p className={styles.subtitle}>Learn English through music</p>
    </div>
    <div className={styles.emptyState}>
      <p>Discover songs for learning</p>
      <button className={styles.primaryButton}>+ Explore Songs</button>
    </div>
  </section>
);

/* Texts Section */
const TextsSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}><FileText size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Texts</h1>
      <p className={styles.subtitle}>Read interesting texts in English</p>
    </div>
    <div className={styles.emptyState}>
      <p>Read texts to improve your comprehension</p>
      <button className={styles.primaryButton}>+ Read Text</button>
    </div>
  </section>
);

/* Achievements Section */
const AchievementsSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}><Trophy size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Achievements</h1>
      <p className={styles.subtitle}>Unlock achievements as you learn</p>
    </div>
    <div className={styles.achievementsGrid}>
      <div className={styles.achievementCard}>
        <div className={styles.achievementIcon}><Star size={40} color="#f093fb" /></div>
        <h3 className={styles.achievementTitle}>First Step</h3>
        <p className={styles.achievementDesc}>Complete your first lesson</p>
      </div>
      <div className={styles.achievementCard}>
        <div className={styles.achievementIcon}><Flame size={40} color="#f5576c" /></div>
        <h3 className={styles.achievementTitle}>On a Streak</h3>
        <p className={styles.achievementDesc}>Maintain a 7-day streak</p>
      </div>
      <div className={styles.achievementCard}>
        <div className={styles.achievementIcon}><Book size={40} color="#667eea" /></div>
        <h3 className={styles.achievementTitle}>Avid Reader</h3>
        <p className={styles.achievementDesc}>Read 10 complete texts</p>
      </div>
      <div className={styles.achievementCard}>
        <div className={styles.achievementIcon}><Award size={40} color="#43e97b" /></div>
        <h3 className={styles.achievementTitle}>Fluent Speaker</h3>
        <p className={styles.achievementDesc}>Complete 50 conversations</p>
      </div>
    </div>
  </section>
);

export default Dashboard;