import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import iconSmall from '../../assets/icons/icon-small.png';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const Navbar = ({ activeSection = '', onSectionChange }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if logout fails, clear local state and redirect
      navigate('/login');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, sectionId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSectionClick(sectionId);
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleHamburgerClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  // Focus management for mobile menu
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
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Desktop Header */}
        <div className={styles.desktopHeader}>
          <div className={styles.logo}>
            <img src={iconSmall} alt="English Notebook" className={styles.logoImg} />
            {!isCollapsed && <span className={styles.logoText}>EN</span>}
          </div>
          <button
            className={styles.toggleBtn}
            onClick={handleToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className={styles.toggleIcon}>{isCollapsed ? '▶' : '◀'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Desktop Navigation Menu */}
        <nav className={styles.nav}>
          <ul className={styles.menu} role="menubar">
            {sections.map((section) => (
              <li key={section.id} role="none">
                <button
                  className={`${styles.navLink} ${activeSection === section.id ? styles.active : ''}`}
                  onClick={() => handleSectionClick(section.id)}
                  onKeyDown={(e) => handleKeyDown(e, section.id)}
                  title={isCollapsed ? section.label : ''}
                  aria-label={section.label}
                  role="menuitem"
                  aria-current={activeSection === section.id ? 'page' : undefined}
                >
                  <span className={styles.icon} aria-hidden="true">{section.icon}</span>
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
            aria-label="Logout"
          >
            <span className={styles.logoutIcon} aria-hidden="true">⊗</span>
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
          onClick={handleHamburgerClick}
          title={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.line1 : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.line2 : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.line3 : ''}`}></span>
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
            <span className={styles.mobileMenuLogoText}>English Notebook</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setIsMenuOpen(false)}
            title="Close menu"
            aria-label="Close menu"
          >
            <span className={styles.closeIcon}>×</span>
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
            <span className={styles.mobileLogoutIcon} aria-hidden="true">⊗</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;