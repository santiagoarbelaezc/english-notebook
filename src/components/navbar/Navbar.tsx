import { useState } from 'react';
import styles from './Navbar.module.css';

interface NavbarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const Navbar = ({ activeSection = '', onSectionChange }: NavbarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: '◆' },
    { id: 'flashcards', label: 'Flashcards', icon: '▥' },
    { id: 'vocabulary', label: 'Vocabulary', icon: '▣' },
    { id: 'grammar', label: 'Grammar', icon: '⬢' },
    { id: 'conversations', label: 'Conversations', icon: '◉' },
    { id: 'daily-phrases', label: 'Daily Phrases', icon: '✦' },
    { id: 'daily-commitments', label: 'Commitments', icon: '▪' },
    { id: 'irregular-verbs', label: 'Irregular Verbs', icon: '⬥' },
    { id: 'movies', label: 'Movies', icon: '▬' },
    { id: 'songs', label: 'Songs', icon: '♫' },
    { id: 'texts', label: 'Texts', icon: '▤' },
    { id: 'achievements', label: 'Achievements', icon: '★' },
    { id: 'profile', label: 'Profile', icon: '⊙' },
  ];

  const handleSectionClick = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>◆</span>
          {!isCollapsed && <span className={styles.logoText}>EN</span>}
        </div>
        <button
          className={styles.toggleBtn}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <span className={styles.toggleIcon}>{isCollapsed ? '›' : '‹'}</span>
        </button>
      </div>

      {/* Divider */}
      <div className={styles.divider}></div>

      {/* Navigation Menu */}
      <nav className={styles.nav}>
        <ul className={styles.menu}>
          {sections.map((section) => (
            <li key={section.id}>
              <button
                className={`${styles.navLink} ${activeSection === section.id ? styles.active : ''}`}
                onClick={() => handleSectionClick(section.id)}
                title={isCollapsed ? section.label : ''}
              >
                <span className={styles.icon}>{section.icon}</span>
                {!isCollapsed && <span className={styles.label}>{section.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.logoutBtn} title="Logout">
          <span className={styles.logoutIcon}>⊗</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
