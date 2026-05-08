import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import '../styles/sidebar.css';

const Sidebar = ({ isOpen, onClose, alertCount = 0 }) => {
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useUser();

  const isAdmin = user?.role === 'admin';
  const isModification = user?.role === 'admin' || user?.role === 'modification';

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleEmoji = (role) => {
    if (role === 'admin') return '👑';
    if (role === 'modification') return '✏️';
    return '👁️';
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="sidebar-close-btn" onClick={onClose}>×</button>

      {/* Logo */}
      <div className="sidebar-header">
        <div className="logo-mark">
          <img src="../assets/logo3.png" alt="Logo" />
        </div>
        <div className="logo-text">
          <h2>MboaSense</h2>

        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Langue switcher */}
        <div className="lang-switcher">
          <button
            className={`lang-btn ${lang === 'fr' ? 'active' : ''}`}
            onClick={() => setLang('fr')}
          >
            🇫🇷 FR
          </button>
          <button
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            🇬🇧 EN
          </button>
        </div>

        <div className="nav-section-label">{t('surveillance') || 'Surveillance'}</div>

        <NavLink to="/dashboard" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          {t('dashboard')}
        </NavLink>

        <NavLink to="/actionneurs" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
          </svg>
          {t('actuators')}
          {!isModification && <span className="nav-readonly">👁️</span>}
        </NavLink>

        <NavLink to="/seuils" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 20h20" /><path d="M6 20V10" /><path d="M10 20V4" /><path d="M14 20V14" /><path d="M18 20V8" />
          </svg>
          {t('thresholds')}
          {!isModification && <span className="nav-readonly">👁️</span>}
        </NavLink>

        <NavLink to="/historique" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          {t('activityLog')}
          {alertCount > 0 && <span className="nav-badge">{alertCount}</span>}
        </NavLink>

        <NavLink to="/parametres" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {t('settings') || 'Paramètres'}
        </NavLink>

        {isAdmin && (
          <>

            <NavLink to="/utilisateurs" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {t('utilisateurs') || 'Utilisateurs'}
            </NavLink>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.nom
            ? getInitials(user.nom)
            : getRoleEmoji(user?.role)
          }
        </div>
        <div className="user-info">
          <div className="user-name">{user?.nom || 'Chargement...'}</div>
          <div className="user-role" style={{ textTransform: 'capitalize' }}>{user?.role || '...'}</div>
        </div>
        <button className="btn-logout" onClick={logout} title={t('logout') || 'Déconnexion'}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;