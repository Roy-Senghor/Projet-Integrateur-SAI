import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { Eye, EyeOff } from 'lucide-react';
import heroImg from '../assets/image.png';

const Login = () => {
  const { t } = useLanguage();
  const { login } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const { data } = await api.post('/auth/login', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      await login(data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || (t('loginError') || 'Erreur de connexion'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">

      {/* ══ PANNEAU GAUCHE — IMAGE ══ */}
      <div className="lp-hero">
        <img src={heroImg} alt="Agriculture intelligente" className="lp-hero-img" />
        <div className="lp-hero-overlay" />
        <div className="lp-hero-content">
          <h1 className="lp-hero-title">AgroSmart</h1>
          <p className="lp-hero-sub">
            Technologie au service d'une agriculture<br />
            <strong>durable et performante.</strong>
          </p>
          <div className="lp-features">
            {[
              { icon: '🌱', label: 'Surveillance des cultures' },
              { icon: '💧', label: 'Irrigation intelligente' },
              { icon: '📊', label: 'Analyse des données' },
              { icon: '🌤️', label: 'Prévisions météo' },
              { icon: '🌿', label: 'Agriculture durable' },
            ].map(f => (
              <div key={f.label} className="lp-chip">
                <span>{f.icon}</span><span>{f.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ══ PANNEAU DROIT — FORMULAIRE ══ */}
      <div className="lp-panel">
        <div className="lp-mobile-brand">
          <div className="lp-mobile-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <span>AgroSmart</span>
        </div>

        <div className="lp-inner">
          <h2 className="lp-title">{t('login') || 'Connexion'}</h2>
          <p className="lp-sub">{t('loginPortal') || 'Bienvenue. Entrez vos identifiants pour accéder au tableau de bord.'}</p>

          {error && (
            <div className="lp-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="lp-form">
            {/* Email */}
            <div className="lp-field">
              <label className="lp-label">{t('email') || 'Adresse email'}</label>
              <div className="lp-iw">
                <svg className="lp-ii" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  className="lp-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@agrosmart.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="lp-field">
              <label className="lp-label">{t('password') || 'Mot de passe'}</label>
              <div className="lp-iw">
                <svg className="lp-ii" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  className="lp-input lp-input-pw"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="lp-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="lp-btn" disabled={loading}>
              {loading ? (
                <><span className="lp-spinner" />{t('loading') || 'Connexion...'}</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  {t('login') || 'Se connecter'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .lp-root {
          display: flex;
          min-height: 100vh;
          width: 100%;
          font-family: 'Inter', sans-serif;
        }

        /* ── Panneau image ── */
        .lp-hero {
          flex: 1.2;
          position: relative;
          overflow: hidden;
        }
        .lp-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .lp-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            145deg,
            rgba(5,25,10,0.88) 0%,
            rgba(10,50,20,0.70) 45%,
            rgba(15,70,30,0.45) 100%
          );
        }
        .lp-hero-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 44px 48px;
          color: white;
        }
        .lp-hero-logo {
          width: 58px; height: 58px;
          background: rgba(255,255,255,0.13);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .lp-hero-title {
          font-size: 2.8rem;
          font-weight: 800;
          letter-spacing: -1px;
          line-height: 1.1;
          margin-bottom: 12px;
          text-shadow: 0 2px 16px rgba(0,0,0,0.35);
        }
        .lp-hero-sub {
          font-size: 1rem;
          color: rgba(255,255,255,0.82);
          line-height: 1.65;
          margin-bottom: 26px;
          max-width: 400px;
        }
        .lp-hero-sub strong { color: white; }
        .lp-features {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 28px;
        }
        .lp-chip {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.11);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 30px;
          padding: 5px 13px;
          font-size: 0.76rem;
          font-weight: 500;
          color: rgba(255,255,255,0.88);
          transition: background 0.2s;
          cursor: default;
        }
        .lp-chip:hover { background: rgba(255,255,255,0.19); }
        .lp-stats {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.09);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 18px;
          padding: 16px 22px;
        }
        .lp-stat-wrap { display: flex; align-items: center; flex: 1; }
        .lp-stat-sep { width: 1px; height: 38px; background: rgba(255,255,255,0.18); margin: 0 6px; }
        .lp-stat { flex: 1; text-align: center; }
        .lp-stat-val {
          font-size: 1.45rem;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          color: white;
          line-height: 1;
          margin-bottom: 4px;
        }
        .lp-stat-label { font-size: 0.68rem; color: rgba(255,255,255,0.68); font-weight: 500; }

        /* ── Panneau formulaire ── */
        .lp-panel {
          width: 460px;
          flex-shrink: 0;
          background: white;
          display: flex;
          flex-direction: column;
          box-shadow: -10px 0 50px rgba(0,0,0,0.09);
          overflow-y: auto;
        }
        .lp-mobile-brand {
          display: none;
          align-items: center;
          gap: 10px;
          padding: 22px 28px 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: #1e3a2f;
        }
        .lp-mobile-logo {
          width: 36px; height: 36px;
          background: linear-gradient(145deg, #2b7e3b, #1f5e2d);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-inner {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 52px 48px;
        }
        .lp-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1e3a2f;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        .lp-sub {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .lp-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          margin-bottom: 20px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          font-size: 0.82rem;
          color: #991b1b;
        }
        .lp-form { display: flex; flex-direction: column; gap: 18px; }
        .lp-field { display: flex; flex-direction: column; gap: 5px; }
        .lp-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #2d4730;
        }
        .lp-iw { position: relative; display: flex; align-items: center; }
        .lp-ii {
          position: absolute;
          left: 13px;
          color: #9ca3af;
          pointer-events: none;
          z-index: 1;
        }
        .lp-input {
          width: 100%;
          padding: 12px 14px 12px 40px;
          height: 46px;
          border-radius: 14px;
          border: 1px solid #d0decb;
          background: white;
          font-size: 0.9rem;
          color: #1e3a2f;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .lp-input:focus {
          outline: none;
          border-color: #2b7e3b;
          box-shadow: 0 0 0 3px rgba(43,126,59,0.15);
        }
        .lp-input-pw { padding-right: 44px; }
        .lp-eye {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .lp-eye:hover { color: #2b7e3b; background: rgba(43,126,59,0.06); }
        .lp-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 50px;
          margin-top: 8px;
          background: #2b7e3b;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .lp-btn:hover:not(:disabled) {
          background: #1f5e2d;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(43,126,59,0.35);
        }
        .lp-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .lp-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: lp-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes lp-spin { to { transform: rotate(360deg); } }
        .lp-demo {
          margin-top: 20px;
          padding: 8px 14px;
          background: #f0f5ed;
          border-radius: 10px;
          font-size: 0.72rem;
          color: #5b7c5a;
          line-height: 1.7;
          text-align: center;
        }
        .lp-demo p { margin: 0; }
        .lp-hint {
          display: flex; align-items: center; justify-content: center;
          gap: 6px;
          margin-top: 24px;
          font-size: 0.7rem;
          color: #9ca3af;
        }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 1100px) {
          .lp-panel { width: 400px; }
          .lp-inner { padding: 40px 36px; }
          .lp-hero-content { padding: 36px; }
          .lp-hero-title { font-size: 2.2rem; }
        }
        @media (max-width: 768px) {
          .lp-root { flex-direction: column; }
          .lp-hero { flex: none; height: 300px; }
          .lp-hero-content { padding: 24px 28px; justify-content: flex-end; }
          .lp-hero-title { font-size: 1.8rem; }
          .lp-hero-sub { font-size: 0.85rem; margin-bottom: 14px; }
          .lp-hero-logo { width: 46px; height: 46px; margin-bottom: 14px; }
          .lp-features { gap: 6px; margin-bottom: 16px; }
          .lp-chip { font-size: 0.72rem; padding: 4px 10px; }
          .lp-stats { padding: 12px 16px; }
          .lp-stat-val { font-size: 1.1rem; }
          .lp-panel { width: 100%; box-shadow: none; }
          .lp-inner { padding: 36px 28px 48px; justify-content: flex-start; }
          .lp-title { font-size: 1.6rem; }
        }
        @media (max-width: 480px) {
          .lp-hero { height: 240px; }
          .lp-hero-logo { display: none; }
          .lp-hero-title { font-size: 1.5rem; }
          .lp-hero-sub { display: none; }
          .lp-features { display: none; }
          .lp-stats { display: none; }
          .lp-mobile-brand { display: flex; }
          .lp-inner { padding: 24px 20px 40px; }
          .lp-title { font-size: 1.4rem; }
          .lp-sub { font-size: 0.82rem; margin-bottom: 24px; }
        }
        @media (max-width: 360px) {
          .lp-hero { height: 180px; }
          .lp-inner { padding: 20px 16px 32px; }
        }
      `}</style>
    </div>
  );
};

export default Login;