import { useState } from 'react';

import styles from './Dashboard.module.css';
import { Navbar } from '../../components';

export const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'flashcards':
        return <FlashcardsSection />;
      case 'vocabulary':
        return <VocabularySection />;
      case 'grammar':
        return <GrammarSection />;
      case 'conversations':
        return <ConversationsSection />;
      case 'daily-phrases':
        return <DailyPhrasesSection />;
      case 'daily-commitments':
        return <DailyCommitmentsSection />;
      case 'irregular-verbs':
        return <IrregularVerbsSection />;
      case 'movies':
        return <MoviesSection />;
      case 'songs':
        return <SongsSection />;
      case 'texts':
        return <TextsSection />;
      case 'achievements':
        return <AchievementsSection />;
      case 'profile':
        return <ProfileSection />;
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
      <h1 className={styles.title}>¡Bienvenido de nuevo!</h1>
      <p className={styles.subtitle}>Continúa aprendiendo inglés de manera divertida y efectiva</p>
    </div>

    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statIcon}>📚</div>
        <div className={styles.statContent}>
          <h3 className={styles.statLabel}>Palabras Aprendidas</h3>
          <p className={styles.statValue}>245</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>🎴</div>
        <div className={styles.statContent}>
          <h3 className={styles.statLabel}>Tarjetas</h3>
          <p className={styles.statValue}>89</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>🏆</div>
        <div className={styles.statContent}>
          <h3 className={styles.statLabel}>Logros</h3>
          <p className={styles.statValue}>12</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>🔥</div>
        <div className={styles.statContent}>
          <h3 className={styles.statLabel}>Racha Actual</h3>
          <p className={styles.statValue}>7 días</p>
        </div>
      </div>
    </div>

    <div className={styles.contentGrid}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Actividad Reciente</h2>
          <span className={styles.badge}>Hoy</span>
        </div>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>✅</span>
            <div className={styles.activityContent}>
              <p className={styles.activityTitle}>Completaste 10 tarjetas de vocabulario</p>
              <p className={styles.activityTime}>Hace 2 horas</p>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>💬</span>
            <div className={styles.activityContent}>
              <p className={styles.activityTitle}>Practicaste una conversación</p>
              <p className={styles.activityTime}>Hace 5 horas</p>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>🎵</span>
            <div className={styles.activityContent}>
              <p className={styles.activityTitle}>Escuchaste una canción en inglés</p>
              <p className={styles.activityTime}>Hace 8 horas</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Compromiso Diario</h2>
          <span className={styles.badge}>3/5</span>
        </div>
        <div className={styles.commitmentList}>
          <div className={styles.commitmentItem}>
            <input type="checkbox" defaultChecked className={styles.checkbox} />
            <span>Aprender 10 palabras nuevas</span>
          </div>
          <div className={styles.commitmentItem}>
            <input type="checkbox" defaultChecked className={styles.checkbox} />
            <span>Practicar gramática</span>
          </div>
          <div className={styles.commitmentItem}>
            <input type="checkbox" className={styles.checkbox} />
            <span>Escuchar una conversación</span>
          </div>
          <div className={styles.commitmentItem}>
            <input type="checkbox" className={styles.checkbox} />
            <span>Ver una película</span>
          </div>
          <div className={styles.commitmentItem}>
            <input type="checkbox" className={styles.checkbox} />
            <span>Escribir un texto</span>
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
      <h1 className={styles.title}>🎴 Tarjetas</h1>
      <p className={styles.subtitle}>Estudia y practica con tarjetas interactivas</p>
    </div>
    <div className={styles.emptyState}>
      <p>Crea tus primeras tarjetas para comenzar a estudiar</p>
      <button className={styles.primaryButton}>+ Crear Tarjeta</button>
    </div>
  </section>
);

/* Vocabulary Section */
const VocabularySection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>📚 Vocabulario</h1>
      <p className={styles.subtitle}>Expande tu vocabulario en inglés</p>
    </div>
    <div className={styles.emptyState}>
      <p>No hay palabras registradas aún</p>
      <button className={styles.primaryButton}>+ Agregar Palabra</button>
    </div>
  </section>
);

/* Grammar Section */
const GrammarSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>✏️ Gramática</h1>
      <p className={styles.subtitle}>Aprende las reglas gramaticales del inglés</p>
    </div>
    <div className={styles.emptyState}>
      <p>Comienza a estudiar gramática</p>
      <button className={styles.primaryButton}>+ Comenzar Lección</button>
    </div>
  </section>
);

/* Conversations Section */
const ConversationsSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>💬 Conversaciones</h1>
      <p className={styles.subtitle}>Practica conversaciones en inglés</p>
    </div>
    <div className={styles.emptyState}>
      <p>Inicia una nueva conversación</p>
      <button className={styles.primaryButton}>+ Nueva Conversación</button>
    </div>
  </section>
);

/* Daily Phrases Section */
const DailyPhrasesSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>⭐ Frases Diarias</h1>
      <p className={styles.subtitle}>Aprende una frase nueva cada día</p>
    </div>
    <div className={styles.card}>
      <div className={styles.phraseCard}>
        <p className={styles.phraseText}>"The early bird catches the worm"</p>
        <p className={styles.phraseTranslation}>Al que madruga, Dios lo ayuda</p>
        <p className={styles.phraseExample}>Ejemplo: If you want to get a good job, you have to be an early bird.</p>
      </div>
    </div>
  </section>
);

/* Daily Commitments Section */
const DailyCommitmentsSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>🎯 Compromisos Diarios</h1>
      <p className={styles.subtitle}>Mantén tu racha de aprendizaje</p>
    </div>
    <div className={styles.card}>
      <div className={styles.commitmentList}>
        <div className={styles.commitmentItem}>
          <input type="checkbox" defaultChecked className={styles.checkbox} />
          <span>Aprender 10 palabras nuevas</span>
        </div>
        <div className={styles.commitmentItem}>
          <input type="checkbox" className={styles.checkbox} />
          <span>Practicar pronunciación (5 min)</span>
        </div>
        <div className={styles.commitmentItem}>
          <input type="checkbox" className={styles.checkbox} />
          <span>Resolver ejercicios de gramática</span>
        </div>
      </div>
    </div>
  </section>
);

/* Irregular Verbs Section */
const IrregularVerbsSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>🔤 Verbos Irregulares</h1>
      <p className={styles.subtitle}>Memoriza los verbos irregulares más comunes</p>
    </div>
    <div className={styles.emptyState}>
      <p>Comienza a estudiar verbos irregulares</p>
      <button className={styles.primaryButton}>+ Empezar</button>
    </div>
  </section>
);

/* Movies Section */
const MoviesSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>🎬 Películas</h1>
      <p className={styles.subtitle}>Mejora tu inglés viendo películas</p>
    </div>
    <div className={styles.emptyState}>
      <p>Explora películas recomendadas</p>
      <button className={styles.primaryButton}>+ Ver Películas</button>
    </div>
  </section>
);

/* Songs Section */
const SongsSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>🎵 Canciones</h1>
      <p className={styles.subtitle}>Aprende inglés a través de la música</p>
    </div>
    <div className={styles.emptyState}>
      <p>Descubre canciones para aprender</p>
      <button className={styles.primaryButton}>+ Explorar Canciones</button>
    </div>
  </section>
);

/* Texts Section */
const TextsSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>📖 Textos</h1>
      <p className={styles.subtitle}>Lee textos interesantes en inglés</p>
    </div>
    <div className={styles.emptyState}>
      <p>Lee textos para mejorar tu comprensión</p>
      <button className={styles.primaryButton}>+ Leer Texto</button>
    </div>
  </section>
);

/* Achievements Section */
const AchievementsSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>🏆 Logros</h1>
      <p className={styles.subtitle}>Desbloquea logros mientras aprendes</p>
    </div>
    <div className={styles.achievementsGrid}>
      <div className={styles.achievementCard}>
        <div className={styles.achievementIcon}>🌟</div>
        <h3 className={styles.achievementTitle}>Primer Paso</h3>
        <p className={styles.achievementDesc}>Completa tu primer lección</p>
      </div>
      <div className={styles.achievementCard}>
        <div className={styles.achievementIcon}>🔥</div>
        <h3 className={styles.achievementTitle}>En Racha</h3>
        <p className={styles.achievementDesc}>Mantén una racha de 7 días</p>
      </div>
      <div className={styles.achievementCard}>
        <div className={styles.achievementIcon}>📚</div>
        <h3 className={styles.achievementTitle}>Lector Avido</h3>
        <p className={styles.achievementDesc}>Lee 10 textos completos</p>
      </div>
      <div className={styles.achievementCard}>
        <div className={styles.achievementIcon}>🎤</div>
        <h3 className={styles.achievementTitle}>Locutor Fluido</h3>
        <p className={styles.achievementDesc}>Completa 50 conversaciones</p>
      </div>
    </div>
  </section>
);

/* Profile Section */
const ProfileSection = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <h1 className={styles.title}>👤 Mi Perfil</h1>
      <p className={styles.subtitle}>Administra tu información personal</p>
    </div>
    <div className={styles.profileCard}>
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>👨‍💼</div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>Santiago Pérez</h2>
          <p className={styles.profileEmail}>santiago@example.com</p>
        </div>
      </div>
      <div className={styles.profileStats}>
        <div className={styles.profileStatItem}>
          <span className={styles.statLabel}>Nivel Actual</span>
          <span className={styles.statValue}>Intermedio</span>
        </div>
        <div className={styles.profileStatItem}>
          <span className={styles.statLabel}>Racha</span>
          <span className={styles.statValue}>7 días</span>
        </div>
        <div className={styles.profileStatItem}>
          <span className={styles.statLabel}>Total de Puntos</span>
          <span className={styles.statValue}>1,250</span>
        </div>
      </div>
      <button className={styles.primaryButton}>Editar Perfil</button>
    </div>
  </section>
);

export default Dashboard;
