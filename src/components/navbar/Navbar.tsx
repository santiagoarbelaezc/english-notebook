import { useState } from 'react';
import styles from './Navbar.module.css';
import iconSmall from '../../assets/icons/icon-small.png';

interface NavbarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const Navbar = ({ activeSection = '', onSectionChange }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    // Aquí iría la lógica de logout
    console.log('Logout clicked');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`${styles.overlay} ${isMenuOpen ? styles.visible : ''}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* Desktop Sidebar */}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        {/* Desktop Header */}
        <div className={styles.desktopHeader}>
          <div className={styles.logo}>
            <img src={iconSmall} alt="English Notebook" className={styles.logoImg} />
            {!isCollapsed && <span className={styles.logoText}>EN</span>}
          </div>
          <button
            className={styles.toggleBtn}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <span className={styles.toggleIcon}>{isCollapsed ? '▶' : '◀'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Desktop Navigation Menu */}
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

        {/* Desktop Footer */}
        <div className={styles.footer}>
          <button 
            className={styles.logoutBtn} 
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : ''}
          >
            <span className={styles.logoutIcon}>⊗</span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileLogo}>
          <img src={iconSmall} alt="English Notebook" className={styles.mobileLogoImg} />
          <span className={styles.mobileLogoText}>EN</span>
        </div>
        <button
          className={styles.hamburger}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.line1 : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.line2 : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.line3 : ''}`}></span>
        </button>
      </header>

      {/* Mobile Side Menu */}
      <aside className={`${styles.mobileSidebar} ${isMenuOpen ? styles.open : ''}`}>
        {/* Mobile Menu Header */}
        <div className={styles.mobileMenuHeader}>
          <div className={styles.mobileMenuLogo}>
            <img src={iconSmall} alt="English Notebook" className={styles.mobileMenuLogoImg} />
            <span className={styles.mobileMenuLogoText}>English Notebook</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setIsMenuOpen(false)}
            title="Close menu"
          >
            <span className={styles.closeIcon}>×</span>
          </button>
        </div>

        {/* Mobile Divider */}
        <div className={styles.mobileDivider}></div>

        {/* Mobile Navigation Menu */}
        <nav className={styles.mobileNav}>
          <ul className={styles.mobileMenu}>
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  className={`${styles.mobileNavLink} ${activeSection === section.id ? styles.mobileActive : ''}`}
                  onClick={() => handleSectionClick(section.id)}
                >
                  <span className={styles.mobileIcon}>{section.icon}</span>
                  <span className={styles.mobileLabel}>{section.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Footer */}
        <div className={styles.mobileFooter}>
          <button className={styles.mobileLogoutBtn} onClick={handleLogout}>
            <span className={styles.mobileLogoutIcon}>⊗</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;