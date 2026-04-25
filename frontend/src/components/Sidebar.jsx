import React from 'react';
import { NavLink } from 'react-router-dom';
import { Power, SlidersHorizontal, History, Settings, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useUser();

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="sidebar-close" onClick={onClose}>×</button>
      <div className="sidebar-logo">
        <div className="logo-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>
        </div>
        <div className="logo-text-wrap">
          <h2>AgroSmart</h2>
        </div>
      </div>

      <div className="nav-label">Agriculture</div>
      <NavLink to="/dashboard" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")} end>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
        {t('dashboard')}
      </NavLink>
      <NavLink to="/actionneurs" className="nav-item">
        <Power /> {t('actuators')}
      </NavLink>
      <NavLink to="/seuils" className="nav-item">
        <SlidersHorizontal />
        {t('thresholds')}
      </NavLink>
      <NavLink to="/alertes" className="nav-item">
        <History />
        {t('activityLog')}
        <span className="badge-count">2</span>
      </NavLink>
      <NavLink to="/parametres" className="nav-item">
        <Settings />
        {t('settings') || 'Settings'}
      </NavLink>

      <div className="sidebar-footer">
        <button
          className="nav-item lang-btn"
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          style={{ width: '100%', border: 'none', background: 'transparent', margin: '4px 0' }}
        >
          <Languages color='green' />
          {lang === 'fr' ? 'English 🇺🇸' : 'Français 🇫🇷'}
        </button>

        <div className="user-card">
          <div className="avatar">{getInitials(user?.nom)}</div>
          <div>
            <div className="user-name">{user?.nom || 'Chargement...'}</div>
            <div className="user-role">{user?.role || '...'}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          {t('logout')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
