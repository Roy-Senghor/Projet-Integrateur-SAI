import { useState } from 'react'

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
  const [profile, setProfile] = useState({
    nom: 'Administrateur', email: 'admin@agriculture.local',
    ferme: 'Ferme AgroSmart N°1', role: 'Administrateur',
  })
  const [notifs, setNotifs] = useState({
    email: true, sms: false, push: true,
    critique: true, warning: true, info: false,
  })
  const [system, setSystem] = useState({
    refresh: '5', langue: 'fr', timezone: 'Africa/Douala',
  })
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [saved, setSaved] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwOk, setPwOk] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handlePw = () => {
    setPwError('')
    if (!passwords.current) { setPwError('Entrez le mot de passe actuel.'); return }
    if (passwords.new.length < 6) { setPwError('Le nouveau mot de passe doit faire au moins 6 caractères.'); return }
    if (passwords.new !== passwords.confirm) { setPwError('Les mots de passe ne correspondent pas.'); return }
    setPwOk(true)
    setPasswords({ current: '', new: '', confirm: '' })
    setTimeout(() => setPwOk(false), 3000)
  }

  return (
    <div className="page-main">
      <div className="topbar">
        <div className="topbar-left">
          <h1>Paramètres</h1>
          <p>Gérez votre compte et les préférences du système</p>
        </div>
      </div>

      <div className="page-content">
        <div className="params-grid">

          {/* Profil */}
          <Section icon="👤" title="Profil utilisateur" sub="Informations du compte" iconBg="var(--green-50)" iconColor="var(--green-700)">
            <div className="param-avatar-row">
              <div className="param-avatar">AD</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{profile.nom}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 2 }}>{profile.role}</div>
              </div>
            </div>
            <div className="param-fields">
              {[
                { label: 'Nom complet', key: 'nom' },
                { label: 'Adresse email', key: 'email' },
                { label: 'Nom de la ferme', key: 'ferme' },
              ].map(f => (
                <div key={f.key} className="form-field">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" value={profile[f.key]}
                    onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="form-field">
                <label className="form-label">Rôle</label>
                <input className="form-input" value={profile.role} disabled />
              </div>
            </div>
          </Section>

          {/* Notifications */}
          <Section icon="🔔" title="Notifications" sub="Canaux et niveaux d'alerte" iconBg="#fffbeb" iconColor="var(--amber)">
            <div className="notif-section-label">Canaux</div>
            {[
              { key: 'email', label: 'Email',             desc: 'Recevoir les alertes par email' },
              { key: 'sms',   label: 'SMS',               desc: 'Recevoir les alertes par SMS' },
              { key: 'push',  label: 'Notifications push', desc: 'Alertes dans le navigateur' },
            ].map(n => (
              <div key={n.key} className="notif-row">
                <div>
                  <div className="notif-label">{n.label}</div>
                  <div className="notif-desc">{n.desc}</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={notifs[n.key]}
                    onChange={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))} />
                  <span className="toggle-slider"/>
                </label>
              </div>
            ))}
            <div className="notif-section-label" style={{ marginTop: 20 }}>Niveaux à recevoir</div>
            {[
              { key: 'critique', label: '🚨 Critique',     desc: 'Urgences immédiates' },
              { key: 'warning',  label: '⚠️ Avertissement', desc: 'Seuils dépassés' },
              { key: 'info',     label: 'ℹ️ Information',    desc: 'Activités normales du système' },
            ].map(n => (
              <div key={n.key} className="notif-row">
                <div>
                  <div className="notif-label">{n.label}</div>
                  <div className="notif-desc">{n.desc}</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={notifs[n.key]}
                    onChange={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))} />
                  <span className="toggle-slider"/>
                </label>
              </div>
            ))}
          </Section>

          {/* Système */}
          <Section icon="⚙️" title="Système" sub="Préférences d'affichage" iconBg="#f5f3ff" iconColor="#7c3aed">
            <div className="param-fields">
              <div className="form-field">
                <label className="form-label">Rafraîchissement auto</label>
                <select className="form-select" value={system.refresh}
                  onChange={e => setSystem(p => ({ ...p, refresh: e.target.value }))}>
                  <option value="2">Toutes les 2 secondes</option>
                  <option value="5">Toutes les 5 secondes</option>
                  <option value="10">Toutes les 10 secondes</option>
                  <option value="30">Toutes les 30 secondes</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Langue</label>
                <select className="form-select" value={system.langue}
                  onChange={e => setSystem(p => ({ ...p, langue: e.target.value }))}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Fuseau horaire</label>
                <select className="form-select" value={system.timezone}
                  onChange={e => setSystem(p => ({ ...p, timezone: e.target.value }))}>
                  <option value="Africa/Douala">Africa/Douala (UTC+1)</option>
                  <option value="Europe/Paris">Europe/Paris (UTC+1/+2)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Sécurité */}
          <Section icon="🔒" title="Sécurité" sub="Changement de mot de passe" iconBg="#fff5f5" iconColor="var(--red)">
            {pwError && <div className="alert-banner error" style={{ marginBottom: 14 }}>{pwError}</div>}
            {pwOk    && <div className="alert-banner success" style={{ marginBottom: 14 }}>✅ Mot de passe modifié</div>}
            <div className="param-fields">
              {[
                { label: 'Mot de passe actuel',          key: 'current'  },
                { label: 'Nouveau mot de passe',         key: 'new'      },
                { label: 'Confirmer le nouveau mot de passe', key: 'confirm' },
              ].map(f => (
                <div key={f.key} className="form-field">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type="password" placeholder="••••••••"
                    value={passwords[f.key]}
                    onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={handlePw}>
              Changer le mot de passe
            </button>
          </Section>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? '✅ Enregistré !' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>

      <style>{`
        .params-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 20px;
          margin-bottom: 8px;
        }
        .param-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-xs);
        }
        .param-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
          background: var(--surface-2);
        }
        .param-card-body { padding: 20px; }
        .param-avatar-row {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--green-50);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          margin-bottom: 18px;
          border: 1px solid var(--border);
        }
        .param-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--green-600), var(--green-400));
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
          color: white;
          flex-shrink: 0;
        }
        .param-fields { display: flex; flex-direction: column; gap: 14px; }
        .notif-section-label {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--text-4);
          margin-bottom: 10px;
        }
        .notif-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: var(--surface-2);
          margin-bottom: 6px;
          border: 1px solid transparent;
          transition: all 0.15s;
        }
        .notif-row:hover { background: white; border-color: var(--border); }
        .notif-label { font-weight: 600; font-size: 0.85rem; }
        .notif-desc  { font-size: 0.72rem; color: var(--text-3); margin-top: 1px; }
        @media (max-width: 800px) { .params-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}

export default Parametres
