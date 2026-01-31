import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import iconSmall from '../../assets/icons/husky.png'; // Cambiado al mismo logo
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const Navbar = ({ activeSection = '', onSectionChange }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'flashcards', label: 'Flashcards', icon: '🎴' },
    { id: 'vocabulary', label: 'Vocabulary', icon: '📝' },
    { id: 'grammar', label: 'Grammar', icon: '📚' },
    { id: 'conversations', label: 'Conversations', icon: '💬' },
    { id: 'daily-phrases', label: 'Daily Phrases', icon: '🗨️' },
    { id: 'daily-commitments', label: 'Commitments', icon: '✅' },
    { id: 'irregular-verbs', label: 'Irregular Verbs', icon: '⚡' },
    { id: 'movies', label: 'Movies', icon: '🎬' },
    { id: 'songs', label: 'Songs', icon: '🎵' },
    { id: 'texts', label: 'Texts', icon: '📄' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const handleSectionClick = (sectionId: string) => {
    const pageRoutes: { [key: string]: string } = {
      'dashboard': '/dashboard',
      'daily-phrases': '/daily-phrases',
      'irregular-verbs': '/irregular-verbs',
      'conversations': '/conversations',
      'profile': '/profile',
      'flashcards': '/flashcards',
      'vocabulary': '/vocabulary',
      'movies': '/movies',
      'songs': '/songs',
      'texts': '/texts',
      'achievements': '/achievements',
      'daily-commitments': '/daily-commitments',
      'grammar': '/grammar',
    };

    if (pageRoutes[sectionId]) {
      navigate(pageRoutes[sectionId]);
    } else if (onSectionChange) {
      onSectionChange(sectionId);
    }

    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, sectionId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSectionClick(sectionId);
    }
  };

  const handleHamburgerClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen && sidebarRef.current) {
      const firstLink = sidebarRef.current.querySelector('[role="menuitem"]') as HTMLElement;
      if (firstLink) firstLink.focus();
    }
  }, [isMenuOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`${styles.overlay} ${isMenuOpen ? styles.visible : ''}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen}
      ></div>

      {/* Desktop Sidebar */}
      <aside
        ref={sidebarRef}
        className={styles.sidebar}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Desktop Header */}
        <div className={styles.desktopHeader}>
          <div className={styles.logo}>
            <img src={iconSmall} alt="English Notebook" className={styles.logoImg} />
            <div className={styles.logoTextContainer}>
              <span className={styles.logoText}>English</span>
              <span className={styles.logoSubText}>Notebook</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Desktop Navigation Menu */}
        <nav className={styles.nav}>
          <ul className={styles.menu} role="menubar">
            {sections.slice(0, 4).map((section) => (
              <li key={section.id} role="none">
                <button
                  className={`${styles.navLink} ${activeSection === section.id ? styles.active : ''}`}
                  onClick={() => handleSectionClick(section.id)}
                  onKeyDown={(e) => handleKeyDown(e, section.id)}
                  aria-label={section.label}
                  role="menuitem"
                  aria-current={activeSection === section.id ? 'page' : undefined}
                >
                  <span className={styles.icon} aria-hidden="true">{section.icon}</span>
                  <span className={styles.label}>{section.label}</span>
                </button>
              </li>
            ))}
          </ul>
          
          {/* Subtle Divider */}
          <div className={styles.subtleDivider}></div>
          
          <ul className={styles.menu} role="menubar">
            {sections.slice(4).map((section) => (
              <li key={section.id} role="none">
                <button
                  className={`${styles.navLink} ${activeSection === section.id ? styles.active : ''}`}
                  onClick={() => handleSectionClick(section.id)}
                  onKeyDown={(e) => handleKeyDown(e, section.id)}
                  aria-label={section.label}
                  role="menuitem"
                  aria-current={activeSection === section.id ? 'page' : undefined}
                >
                  <span className={styles.icon} aria-hidden="true">{section.icon}</span>
                  <span className={styles.label}>{section.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Subtle Divider */}
        <div className={styles.subtleDivider}></div>

        {/* Desktop Footer */}
        <div className={styles.footer}>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            aria-label="Logout"
          >
            <span className={styles.logoutIcon} aria-hidden="true">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileLogo}>
          <img src={iconSmall} alt="English Notebook" className={styles.mobileLogoImg} />
          <div className={styles.mobileLogoTextContainer}>
            <span className={styles.mobileLogoText}>English</span>
            <span className={styles.mobileLogoSubText}>Notebook</span>
          </div>
        </div>
        <button
          className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}
          onClick={handleHamburgerClick}
          title={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
      </header>

      {/* Mobile Side Menu */}
      <aside
        className={`${styles.mobileSidebar} ${isMenuOpen ? styles.open : ''}`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Mobile Menu Header */}
        <div className={styles.mobileMenuHeader}>
          <div className={styles.mobileMenuLogo}>
            <img src={iconSmall} alt="English Notebook" className={styles.mobileMenuLogoImg} />
            <div className={styles.mobileMenuLogoTextContainer}>
              <span className={styles.mobileMenuLogoText}>English</span>
              <span className={styles.mobileMenuLogoSubText}>Notebook</span>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setIsMenuOpen(false)}
            title="Close menu"
            aria-label="Close menu"
          >
            <span className={styles.closeIcon}>✕</span>
          </button>
        </div>

        {/* Mobile Divider */}
        <div className={styles.mobileDivider}></div>

        {/* Mobile Navigation Menu */}
        <nav className={styles.mobileNav}>
          <ul className={styles.mobileMenu} role="menubar">
            {sections.map((section) => (
              <li key={section.id} role="none">
                <button
                  className={`${styles.mobileNavLink} ${activeSection === section.id ? styles.mobileActive : ''}`}
                  onClick={() => handleSectionClick(section.id)}
                  onKeyDown={(e) => handleKeyDown(e, section.id)}
                  aria-label={section.label}
                  role="menuitem"
                  aria-current={activeSection === section.id ? 'page' : undefined}
                >
                  <span className={styles.mobileIcon} aria-hidden="true">{section.icon}</span>
                  <span className={styles.mobileLabel}>{section.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Footer */}
        <div className={styles.mobileFooter}>
          <button
            className={styles.mobileLogoutBtn}
            onClick={handleLogout}
            aria-label="Logout"
          >
            <span className={styles.mobileLogoutIcon} aria-hidden="true">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;