import { useEffect, useState } from 'react'
import api from '../services/api'

const ROLES = ['consultation', 'modification', 'admin']
const ROLE_COLORS = {
  admin:        { badge: 'badge-red',   label: '👑 Admin' },
  modification: { badge: 'badge-blue',  label: '✏️ Modificateur' },
  consultation: { badge: 'badge-green', label: '👁️ Consultation' },
}

const Utilisateurs = () => {
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [erreur,   setErreur]   = useState(null)
  const [success,  setSuccess]  = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState({ nom: '', email: '', password: '', role: 'consultation' })
  const [creating, setCreating] = useState(false)
  const [formErr,  setFormErr]  = useState('')

  const charger = async () => {
    try {
      const res = await api.get('/utilisateurs/')
      setUsers(res.data)
    } catch {
      setErreur('Impossible de charger les utilisateurs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { charger() }, [])

  const notif = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000) }

  const toggleActif = async (id) => {
    try {
      const res = await api.patch(`/utilisateurs/${id}/toggle`)
      setUsers(p => p.map(u => u.id === id ? res.data : u))
      notif('Statut modifié avec succès')
    } catch { setErreur('Erreur lors de la modification.') }
  }

  const changerRole = async (id, role) => {
    try {
      const res = await api.patch(`/utilisateurs/${id}/role`, null, { params: { role } })
      setUsers(p => p.map(u => u.id === id ? res.data : u))
      notif('Rôle modifié avec succès')
    } catch { setErreur('Erreur lors du changement de rôle.') }
  }

  const supprimer = async (id, nom) => {
    if (!window.confirm(`Supprimer l'utilisateur "${nom}" ?`)) return
    try {
      await api.delete(`/utilisateurs/${id}`)
      setUsers(p => p.filter(u => u.id !== id))
      notif('Utilisateur supprimé')
    } catch (e) { setErreur(e.response?.data?.detail || 'Erreur lors de la suppression.') }
  }

  const creer = async e => {
    e.preventDefault()
    setFormErr('')
    if (!form.nom || !form.email || !form.password) { setFormErr('Tous les champs sont requis.'); return }
    if (form.password.length < 6) { setFormErr('Le mot de passe doit faire au moins 6 caractères.'); return }
    setCreating(true)
    try {
      const res = await api.post('/utilisateurs/', form)
      setUsers(p => [res.data, ...p])
      setShowForm(false)
      setForm({ nom: '', email: '', password: '', role: 'consultation' })
      notif(`Utilisateur "${res.data.nom}" créé avec succès`)
    } catch (e) { setFormErr(e.response?.data?.detail || 'Erreur lors de la création.') }
    finally { setCreating(false) }
  }

  return (
    <div className="page-main">
      <div className="topbar">
        <div className="topbar-left">
          <h1>Utilisateurs</h1>
          <p>Gestion des comptes et des accès — {users.length} utilisateur{users.length > 1 ? 's' : ''}</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouvel utilisateur
          </button>
        </div>
      </div>

      <div className="page-content">
        {erreur  && <div className="alert-banner error">{erreur}</div>}
        {success && <div className="alert-banner success">✅ {success}</div>}

        {/* Formulaire création */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Créer un utilisateur</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
              </div>
              {formErr && <div className="alert-banner error" style={{ margin: '0 20px 16px' }}>{formErr}</div>}
              <form onSubmit={creer} className="modal-body">
                <div className="form-field">
                  <label className="form-label">Nom complet</label>
                  <input className="form-input" value={form.nom}
                    onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                    placeholder="Jean Dupont" required/>
                </div>
                <div className="form-field">
                  <label className="form-label">Adresse email</label>
                  <input className="form-input" type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="jean@exemple.com" required/>
                </div>
                <div className="form-field">
                  <label className="form-label">Mot de passe</label>
                  <input className="form-input" type="password" value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min. 6 caractères" required/>
                </div>
                <div className="form-field">
                  <label className="form-label">Rôle</label>
                  <select className="form-select" value={form.role}
                    onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="consultation">👁️ Consultation — lecture seule</option>
                    <option value="modification">✏️ Modification — peut modifier</option>
                    <option value="admin">👑 Administrateur — accès total</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary" disabled={creating}>
                    {creating ? <><span className="spinner" style={{width:14,height:14}}/>Création...</> : 'Créer le compte'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="users-stats">
          {[
            { label: 'Total',         val: users.length,                                        color: 'var(--blue)',     bg: '#eff6ff' },
            { label: 'Actifs',        val: users.filter(u => u.is_active).length,               color: 'var(--green-600)',bg: 'var(--green-50)' },
            { label: 'Admins',        val: users.filter(u => u.role === 'admin').length,        color: 'var(--red)',      bg: '#fff5f5' },
            { label: 'Modificateurs', val: users.filter(u => u.role === 'modification').length, color: 'var(--blue)',     bg: '#eff6ff' },
            { label: 'Consultation',  val: users.filter(u => u.role === 'consultation').length, color: 'var(--amber)',    bg: '#fffbeb' },
          ].map(s => (
            <div key={s.label} className="user-stat" style={{ background: s.bg }}>
              <div style={{ fontSize:'1.6rem', fontWeight:800, fontFamily:"'JetBrains Mono',monospace", color:s.color, lineHeight:1 }}>{s.val}</div>
              <div style={{ fontSize:'0.68rem', fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.5px', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-wrap"><div className="spinner"/>Chargement...</div>
        ) : (
          <div className="card users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Créé le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={!u.is_active ? 'user-inactive' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="user-table-avatar" style={{ background: u.role === 'admin' ? '#fee2e2' : u.role === 'modification' ? '#dbeafe' : '#d1fae5' }}>
                          {u.role === 'admin' ? '👑' : u.role === 'modification' ? '✏️' : '👁️'}
                        </div>
                        <div>
                          <div className="user-cell-name">{u.nom}</div>
                          <div className="user-cell-id">#{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="user-email">{u.email}</td>
                    <td>
                      <select
                        className="role-select"
                        value={u.role}
                        onChange={e => changerRole(u.id, e.target.value)}
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r}>{ROLE_COLORS[r].label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <label className="toggle">
                        <input type="checkbox" checked={u.is_active} onChange={() => toggleActif(u.id)}/>
                        <span className="toggle-slider"/>
                      </label>
                    </td>
                    <td className="user-date">
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => supprimer(u.id, u.nom)}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                        </svg>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="empty-state"><span className="icon">👥</span><p>Aucun utilisateur trouvé</p></div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .users-stats { display:flex; gap:12px; margin-bottom:24px; flex-wrap:wrap; }
        .user-stat { flex:1; min-width:100px; padding:16px 18px; border-radius:var(--radius-md); border:1px solid var(--border); text-align:center; }
        .users-table-wrap { overflow-x:auto; }
        .users-table { width:100%; border-collapse:collapse; }
        .users-table th { padding:12px 16px; text-align:left; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-3); background:var(--surface-2); border-bottom:1px solid var(--border); }
        .users-table td { padding:14px 16px; border-bottom:1px solid var(--border); vertical-align:middle; }
        .users-table tr:last-child td { border-bottom:none; }
        .users-table tr:hover td { background:var(--green-50); }
        .user-inactive td { opacity:0.5; }
        .user-cell { display:flex; align-items:center; gap:10px; }
        .user-table-avatar { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
        .user-cell-name { font-weight:600; font-size:0.875rem; }
        .user-cell-id { font-size:0.68rem; color:var(--text-4); font-family:'JetBrains Mono',monospace; }
        .user-email { font-size:0.82rem; color:var(--text-2); font-family:'JetBrains Mono',monospace; }
        .user-date { font-size:0.78rem; color:var(--text-3); font-family:'JetBrains Mono',monospace; }
        .role-select { padding:5px 10px; border:1px solid var(--border); border-radius:8px; font-size:0.78rem; font-family:inherit; background:var(--surface-2); cursor:pointer; outline:none; }
        .role-select:focus { border-color:var(--green-500); }

        /* Modal */
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s; }
        .modal-card { background:white; border-radius:24px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.2); overflow:hidden; }
        .modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid var(--border); }
        .modal-header h3 { font-size:1.1rem; font-weight:700; }
        .modal-close { background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-3); line-height:1; padding:0 4px; }
        .modal-close:hover { color:var(--text-1); }
        .modal-body { display:flex; flex-direction:column; gap:16px; padding:24px; }
        .modal-footer { display:flex; justify-content:flex-end; gap:10px; padding-top:8px; border-top:1px solid var(--border); margin-top:8px; }
      `}</style>
    </div>
  )
}

export default Utilisateurs
