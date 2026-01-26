import { useState } from 'react';

import styles from './Dashboard.module.css';
import { Navbar } from '../../components/navbar/Navbar';
import Profile from '../profile';
import IrregularVerbs from '../irregular-verbs';
import Grammar from '../grammar';
import Conversations from '../conversations';

export const Dashboard = () => {
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
    <div className={styles.dashboardContainer}>
      <Navbar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className={styles.mainContent}>{renderContent()}</main>
    </div>
  );
};

/* Main Dashboard Section */
const MainDashboardSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>Welcome Back!</h1>
      <p className={styles.subtitle}>Continue learning English in a fun and effective way</p>
    </div>

    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statIcon}>📚</div>
        <div className={styles.statContent}>
          <h3 className={styles.statLabel}>Words Learned</h3>
          <p className={styles.statValue}>245</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>🎴</div>
        <div className={styles.statContent}>
          <h3 className={styles.statLabel}>Flashcards</h3>
          <p className={styles.statValue}>89</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>🏆</div>
        <div className={styles.statContent}>
          <h3 className={styles.statLabel}>Achievements</h3>
          <p className={styles.statValue}>12</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>🔥</div>
        <div className={styles.statContent}>
          <h3 className={styles.statLabel}>Current Streak</h3>
          <p className={styles.statValue}>7 days</p>
        </div>
      </div>
    </div>

    <div className={styles.contentGrid}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Recent Activity</h2>
          <span className={styles.badge}>Today</span>
        </div>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>✅</span>
            <div className={styles.activityContent}>
              <p className={styles.activityTitle}>Completed 10 vocabulary flashcards</p>
              <p className={styles.activityTime}>2 hours ago</p>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>💬</span>
            <div className={styles.activityContent}>
              <p className={styles.activityTitle}>Practiced a conversation</p>
              <p className={styles.activityTime}>5 hours ago</p>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>🎵</span>
            <div className={styles.activityContent}>
              <p className={styles.activityTitle}>Listened to an English song</p>
              <p className={styles.activityTime}>8 hours ago</p>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  </section>
);

/* Flashcards Section */
const FlashcardsSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>🎴 Flashcards</h1>
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
      <h1 className={styles.title}>📚 Vocabulary</h1>
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
const DailyPhrasesSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>⭐ Daily Phrases</h1>
      <p className={styles.subtitle}>Learn a new phrase every day</p>
    </div>
    <div className={styles.card}>
      <div className={styles.phraseCard}>
        <p className={styles.phraseText}>"The early bird catches the worm"</p>
        <p className={styles.phraseTranslation}>The early bird gets the worm</p>
        <p className={styles.phraseExample}>Example: If you want to get a good job, you have to be an early bird.</p>
      </div>
    </div>
  </section>
);

/* Daily Commitments Section */
const DailyCommitmentsSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>🎯 Daily Commitments</h1>
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
      <h1 className={styles.title}>🎬 Movies</h1>
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
      <h1 className={styles.title}>🎵 Songs</h1>
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
      <h1 className={styles.title}>📖 Texts</h1>
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
      <h1 className={styles.title}>🏆 Achievements</h1>
      <p className={styles.subtitle}>Unlock achievements as you learn</p>
    </div>
    <div className={styles.achievementsGrid}>
      <div className={styles.achievementCard}>
        <div className={styles.achievementIcon}>🌟</div>
        <h3 className={styles.achievementTitle}>First Step</h3>
        <p className={styles.achievementDesc}>Complete your first lesson</p>
      </div>
      <div className={styles.achievementCard}>
        <div className={styles.achievementIcon}>🔥</div>
        <h3 className={styles.achievementTitle}>On a Streak</h3>
        <p className={styles.achievementDesc}>Maintain a 7-day streak</p>
      </div>
      <div className={styles.achievementCard}>
        <div className={styles.achievementIcon}>📚</div>
        <h3 className={styles.achievementTitle}>Avid Reader</h3>
        <p className={styles.achievementDesc}>Read 10 complete texts</p>
      </div>
      <div className={styles.achievementCard}>
        <div className={styles.achievementIcon}>🎤</div>
        <h3 className={styles.achievementTitle}>Fluent Speaker</h3>
        <p className={styles.achievementDesc}>Complete 50 conversations</p>
      </div>
    </div>
  </section>
);

export default Dashboard;