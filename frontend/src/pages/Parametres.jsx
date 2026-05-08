import { useState } from 'react'
import { useLanguage as useLang } from '../context/LanguageContext'
import api from '../services/api'

const Section = ({ icon, title, sub, iconBg, iconColor, children }) => (
  <div className="param-card">
    <div className="param-card-header">
      <div className="card-icon" style={{ background: iconBg }}>
        <span style={{ color: iconColor, fontSize: '1.1rem' }}>{icon}</span>
      </div>
      <div>
        <div className="card-title">{title}</div>
        <div className="card-sub">{sub}</div>
      </div>
    </div>
    <div className="param-card-body">{children}</div>
  </div>
)

const Parametres = () => {
  const { lang, switchLang, tObj } = useLang()
  const p = tObj.parametres || {}

  const [profile, setProfile] = useState({
    nom: 'Administrateur', email: 'admin@agriculture.local',
    ferme: 'Ferme AgroSmart N°1', role: 'Administrateur',
  })
  const [notifs, setNotifs] = useState({
    email: true, push: true,
    critique: true, warning: true, info: false,
  })
  const [system, setSystem] = useState({
    refresh: '5', langue: lang, timezone: 'Africa/Douala',
  })
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [emailConfig, setEmailConfig] = useState({
    gmail: '', appPwd: '', recipient: '',
  })

  const [saved,    setSaved]    = useState(false)
  const [pwError,  setPwError]  = useState('')
  const [pwOk,     setPwOk]     = useState(false)
  const [emailSent,setEmailSent]= useState(false)
  const [emailErr, setEmailErr] = useState('')
  const [sending,  setSending]  = useState(false)

  const handleSave = () => {
    // Appliquer la langue si changée
    if (system.langue !== lang) switchLang(system.langue)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handlePw = () => {
    setPwError('')
    if (!passwords.current) { setPwError(p.pwRequired); return }
    if (passwords.new.length < 6) { setPwError(p.pwTooShort); return }
    if (passwords.new !== passwords.confirm) { setPwError(p.pwMismatch); return }
    setPwOk(true)
    setPasswords({ current: '', new: '', confirm: '' })
    setTimeout(() => setPwOk(false), 3000)
  }

  const handleTestEmail = async () => {
    setSending(true); setEmailErr(''); setEmailSent(false)
    try {
      await api.post('/notifications/test-email', { recipient: emailConfig.recipient || profile.email })
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 4000)
    } catch (e) {
      setEmailErr(e.response?.data?.detail || p.emailErr)
    } finally { setSending(false) }
  }

  return (
    <div className="pm-page">
      {/* ══ HERO ══ */}
      <div className="pm-hero">
        <div className="pm-hero-overlay" />
        <div className="pm-hero-body">
          <div className="pm-crumb">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Administration
          </div>
          <h1 className="pm-hero-title">{p.title}</h1>
          <p className="pm-hero-sub">{p.subtitle}</p>

          <div className="pm-hero-pills">
            <div className="pm-pill pm-pill-blue">
              <span className="pm-pill-val">{profile.role}</span>
              <span className="pm-pill-label">Profil</span>
            </div>
            <div className="pm-pill pm-pill-green">
              <span className="pm-pill-val">Actives</span>
              <span className="pm-pill-label">Notifications</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pm-content">
        <div className="params-grid">

          {/* Profil */}
          <Section icon="👤" title={p.profile} sub={p.profileSub} iconBg="var(--green-50)" iconColor="var(--green-700)">
            <div className="param-avatar-row">
              <div className="param-avatar">AD</div>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{profile.nom}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-3)', marginTop:2 }}>{profile.role}</div>
              </div>
            </div>
            <div className="param-fields">
              {[
                { label: p.fullName, key: 'nom' },
                { label: p.emailAddr, key: 'email' },
                { label: p.farmName, key: 'ferme' },
              ].map(f => (
                <div key={f.key} className="form-field">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" value={profile[f.key]}
                    onChange={e => setProfile(pr => ({ ...pr, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="form-field">
                <label className="form-label">{p.role}</label>
                <input className="form-input" value={profile.role} disabled />
              </div>
            </div>
          </Section>

          {/* Notifications — sans SMS */}
          <Section icon="🔔" title={p.notifs} sub={p.notifsSub} iconBg="#fffbeb" iconColor="var(--amber)">
            <div className="notif-section-label">{p.channels}</div>
            {[
              { key: 'email', label: p.emailNotif, desc: p.emailDesc },
              { key: 'push',  label: p.pushNotif,  desc: p.pushDesc  },
            ].map(n => (
              <div key={n.key} className="notif-row">
                <div>
                  <div className="notif-label">{n.label}</div>
                  <div className="notif-desc">{n.desc}</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={notifs[n.key]}
                    onChange={() => setNotifs(pr => ({ ...pr, [n.key]: !pr[n.key] }))} />
                  <span className="toggle-slider"/>
                </label>
              </div>
            ))}
            <div className="notif-section-label" style={{ marginTop:20 }}>{p.levels}</div>
            {[
              { key:'critique', label: p.critLevel, desc: p.critDesc },
              { key:'warning',  label: p.warnLevel, desc: p.warnDesc },
              { key:'info',     label: p.infoLevel, desc: p.infoDesc },
            ].map(n => (
              <div key={n.key} className="notif-row">
                <div>
                  <div className="notif-label">{n.label}</div>
                  <div className="notif-desc">{n.desc}</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={notifs[n.key]}
                    onChange={() => setNotifs(pr => ({ ...pr, [n.key]: !pr[n.key] }))} />
                  <span className="toggle-slider"/>
                </label>
              </div>
            ))}
          </Section>

          {/* Config Email Gmail */}
          <Section icon="📧" title={p.emailConfig} sub={p.emailConfigSub} iconBg="#eff6ff" iconColor="var(--blue)">
            {emailSent && <div className="alert-banner success" style={{ marginBottom:14 }}>{p.emailSent}</div>}
            {emailErr  && <div className="alert-banner error"   style={{ marginBottom:14 }}>{emailErr}</div>}
            <div className="param-fields">
              <div className="form-field">
                <label className="form-label">{p.gmailAddr}</label>
                <input className="form-input" type="email" value={emailConfig.gmail}
                  onChange={e => setEmailConfig(pr => ({ ...pr, gmail: e.target.value }))}
                  placeholder="votre@gmail.com" />
              </div>
              <div className="form-field">
                <label className="form-label">{p.gmailPwd}</label>
                <input className="form-input" type="password" value={emailConfig.appPwd}
                  onChange={e => setEmailConfig(pr => ({ ...pr, appPwd: e.target.value }))}
                  placeholder="xxxx xxxx xxxx xxxx" />
                <span style={{ fontSize:'0.7rem', color:'var(--text-4)', marginTop:4, display:'block' }}>
                  💡 {p.gmailHint}
                </span>
              </div>
              <div className="form-field">
                <label className="form-label">{p.recipient}</label>
                <input className="form-input" type="email" value={emailConfig.recipient}
                  onChange={e => setEmailConfig(pr => ({ ...pr, recipient: e.target.value }))}
                  placeholder="destinataire@exemple.com" />
              </div>
            </div>
            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:12 }}
              onClick={handleTestEmail} disabled={sending}>
              {sending
                ? <><span className="spinner" style={{width:14,height:14}}/>Envoi...</>
                : <>📧 {p.testEmail}</>}
            </button>
          </Section>

          {/* Système */}
          <Section icon="⚙️" title={p.system} sub={p.systemSub} iconBg="#f5f3ff" iconColor="#7c3aed">
            <div className="param-fields">
              <div className="form-field">
                <label className="form-label">{p.refresh}</label>
                <select className="form-select" value={system.refresh}
                  onChange={e => setSystem(pr => ({ ...pr, refresh: e.target.value }))}>
                  {Object.entries(p.refreshOptions || {}).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">{p.lang}</label>
                <select className="form-select" value={system.langue}
                  onChange={e => setSystem(pr => ({ ...pr, langue: e.target.value }))}>
                  {Object.entries(p.langOptions || {}).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">{p.timezone}</label>
                <select className="form-select" value={system.timezone}
                  onChange={e => setSystem(pr => ({ ...pr, timezone: e.target.value }))}>
                  {Object.entries(p.tzOptions || {}).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </Section>

          {/* Sécurité */}
          <Section icon="🔒" title={p.security} sub={p.securitySub} iconBg="#fff5f5" iconColor="var(--red)">
            {pwError && <div className="alert-banner error" style={{ marginBottom:14 }}>{pwError}</div>}
            {pwOk    && <div className="alert-banner success" style={{ marginBottom:14 }}>{p.pwChanged}</div>}
            <div className="param-fields">
              {[
                { label: p.currentPw, key:'current' },
                { label: p.newPw,     key:'new' },
                { label: p.confirmPw, key:'confirm' },
              ].map(f => (
                <div key={f.key} className="form-field">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type="password" placeholder="••••••••"
                    value={passwords[f.key]}
                    onChange={e => setPasswords(pr => ({ ...pr, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <button className="btn btn-danger" style={{ width:'100%', justifyContent:'center', marginTop:8 }} onClick={handlePw}>
              {p.changePw}
            </button>
          </Section>

        </div>

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:24, paddingTop:24, borderTop:'1px solid var(--border)' }}>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>{p.cancel}</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? p.saved : p.saveAll}
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');

        .pm-page {
          flex: 1;
          min-height: 100vh;
          background: #f4f6f3;
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ══ HERO ══ */
        .pm-hero {
          position: relative;
          height: 210px;
          background: linear-gradient(135deg, #1a3a1f 0%, #2d6a35 50%, #3a8c45 100%);
          overflow: hidden;
        }
        .pm-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            radial-gradient(ellipse 50% 60% at 80% 10%, rgba(255,255,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 5% 90%,  rgba(0,0,0,0.12) 0%, transparent 50%);
        }
        .pm-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.3) 100%);
        }
        .pm-hero-body {
          position: relative; z-index: 2;
          padding: 28px 32px 0;
        }
        .pm-crumb {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          padding: 3px 12px;
          font-size: 0.7rem; font-weight: 600;
          color: rgba(255,255,255,0.88);
          margin-bottom: 10px;
        }
        .pm-hero-title {
          font-size: 2rem; font-weight: 700;
          color: white; letter-spacing: -0.5px;
          line-height: 1.15; margin-bottom: 4px;
        }
        .pm-hero-sub {
          font-size: 0.8rem; color: rgba(255,255,255,0.65);
          margin-bottom: 20px;
        }
        .pm-hero-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .pm-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 14px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.18);
        }
        .pm-pill-green { background: rgba(34,197,94,0.25); }
        .pm-pill-gray  { background: rgba(255,255,255,0.12); }
        .pm-pill-blue  { background: rgba(59,130,246,0.25); }
        .pm-pill-val {
          font-size: 0.95rem; font-weight: 700; color: white;
          line-height: 1;
        }
        .pm-pill-label {
          font-size: 0.67rem; font-weight: 600;
          color: rgba(255,255,255,0.75);
          text-transform: uppercase; letter-spacing: 0.5px;
        }

        /* ══ CONTENT ══ */
        .pm-content {
          padding: 20px 28px 48px;
          display: flex; flex-direction: column; gap: 20px;
        }

        .params-grid { 
          display:grid; grid-template-columns:repeat(auto-fill,minmax(350px,1fr)); gap:20px;
          margin-top: -48px; position: relative; z-index: 10;
        }
        .param-card { background:white; border:1px solid rgba(0,0,0,0.06); border-radius:18px; overflow:hidden; box-shadow:0 3px 14px rgba(0,0,0,0.07); transition: transform 0.2s, box-shadow 0.2s; }
        .param-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .param-card-header { display:flex; align-items:center; gap:12px; padding:18px 20px; border-bottom:1px solid rgba(0,0,0,0.05); }
        .param-card-body { padding:20px; }
        .card-icon { width:44px; height:44px; border-radius:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .card-title { font-weight:700; font-size:0.9rem; color:#1a1a1a; margin-bottom:2px; }
        .card-sub { font-size:0.75rem; color:#aaa; line-height: 1.3; margin: 0; }
        .param-avatar-row { display:flex; align-items:center; gap:12px; background:#f0fdf4; border-radius:14px; padding:14px 16px; margin-bottom:18px; border:1px solid rgba(34,197,94,0.1); }
        .param-avatar { width:44px; height:44px; background:linear-gradient(135deg,#1a4a26,#3a9e4a); border-radius:14px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.9rem; color:white; flex-shrink:0; }
        .param-fields { display:flex; flex-direction:column; gap:14px; }
        .notif-section-label { font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#aaa; margin-bottom:10px; }
        .notif-row { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-radius:12px; background:#fafafa; margin-bottom:6px; border:1px solid rgba(0,0,0,0.04); transition:all 0.15s; }
        .notif-row:hover { background:white; border-color:rgba(0,0,0,0.08); box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
        .notif-label { font-weight:600; font-size:0.84rem; color:#1a1a1a; }
        .notif-desc { font-size:0.72rem; color:#aaa; margin-top:2px; }
        
        .form-field { display:flex; flex-direction:column; gap:6px; }
        .form-label { font-size:0.75rem; font-weight:600; color:#555; }
        .form-input, .form-select { width:100%; padding:10px 14px; border-radius:10px; border:1px solid #e5e7eb; font-family:'DM Sans', sans-serif; font-size:0.85rem; color:#1a1a1a; transition: border-color 0.15s, box-shadow 0.15s; background: white; }
        .form-input:focus, .form-select:focus { outline:none; border-color:#22c55e; box-shadow:0 0 0 3px rgba(34,197,94,0.15); }
        .form-input:disabled { background:#f9fafb; color:#9ca3af; }
        
        .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 16px; border-radius:10px; font-weight:600; font-size:0.85rem; cursor:pointer; transition:all 0.15s; border:none; font-family:'DM Sans', sans-serif; }
        .btn-primary { background:#1a4a26; color:white; box-shadow:0 2px 8px rgba(26,74,38,0.2); }
        .btn-primary:hover:not(:disabled) { background:#2b7e3b; box-shadow:0 4px 12px rgba(26,74,38,0.3); transform:translateY(-1px); }
        .btn-secondary { background:white; border:1px solid #e5e7eb; color:#4b5563; }
        .btn-secondary:hover:not(:disabled) { background:#f9fafb; border-color:#d1d5db; color:#111827; }
        .btn-danger { background:#ef4444; color:white; box-shadow:0 2px 8px rgba(239,68,68,0.2); }
        .btn-danger:hover:not(:disabled) { background:#dc2626; box-shadow:0 4px 12px rgba(239,68,68,0.3); transform:translateY(-1px); }
        .btn:disabled { opacity:0.6; cursor:not-allowed; }
        
        .alert-banner { padding:10px 14px; border-radius:10px; font-size:0.82rem; font-weight:500; display:flex; align-items:center; gap:8px; }
        .alert-banner.success { background:#dcfce7; color:#166534; border:1px solid #bbf7d0; }
        .alert-banner.error { background:#fee2e2; color:#991b1b; border:1px solid #fecaca; }
        
        /* Toggle Switch */
        .toggle { position:relative; display:inline-block; width:36px; height:20px; flex-shrink:0; }
        .toggle input { opacity:0; width:0; height:0; }
        .toggle-slider { position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#e5e7eb; transition:.2s; border-radius:20px; }
        .toggle-slider:before { position:absolute; content:""; height:16px; width:16px; left:2px; bottom:2px; background-color:white; transition:.2s; border-radius:50%; box-shadow:0 1px 3px rgba(0,0,0,0.1); }
        .toggle input:checked + .toggle-slider { background-color:#22c55e; }
        .toggle input:checked + .toggle-slider:before { transform:translateX(16px); }

        @media (max-width:768px) {
          .pm-hero { height: 200px; }
          .pm-hero-body { padding: 20px 20px 0; }
          .pm-hero-title { font-size: 1.6rem; }
          .pm-content { padding: 14px 16px 36px; }
          .params-grid { grid-template-columns: 1fr; margin-top: -36px; }
        }
      `}</style>
    </div>
  )
}

export default Parametres