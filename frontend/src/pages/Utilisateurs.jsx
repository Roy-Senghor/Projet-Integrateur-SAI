import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const Utilisateurs = () => {
  const { tObj } = useLanguage();
  const p = tObj.usersPage || {};

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ nom: '', email: '', password: '', role: 'consultation' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/');
      setUsers(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(p.loadError || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditUser(null);
    setFormData({ nom: '', email: '', password: '', role: 'consultation' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditUser(u);
    setFormData({ nom: u.nom, email: u.email, password: '', role: u.role });
    setFormError('');
    setShowModal(true);
  };

  const handleToggleActive = async (u) => {
    if (u.is_active && !window.confirm(p.deleteMsg || "Désactiver cet utilisateur ?")) return;
    try {
      await api.put(`/users/${u.id}`, { is_active: !u.is_active });
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.detail || 'Erreur');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (editUser) {
        const payload = { nom: formData.nom, email: formData.email, role: formData.role };
        if (formData.password) payload.password = formData.password;
        await api.put(`/users/${editUser.id}`, payload);
      } else {
        await api.post('/users/', formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: users.length,
    actifs: users.filter(u => u.is_active).length,
    admins: users.filter(u => u.role === 'admin').length,
    modifs: users.filter(u => u.role === 'modification').length,
    consul: users.filter(u => u.role === 'consultation').length
  };

  return (
    <div className="us-page">
      {/* ══ HERO ══ */}
      <div className="us-hero">
        <div className="us-hero-overlay" />
        <div className="us-hero-body">
          <div className="us-crumb">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Administration
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="us-hero-title">{p.title}</h1>
              <p className="us-hero-sub">{p.subtitle} — {stats.total} utilisateur{stats.total > 1 ? 's' : ''}</p>
            </div>
            <button className="btn btn-primary" onClick={openCreateModal} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              {p.newUser}
            </button>
          </div>
        </div>
      </div>

      <div className="us-content">
        {error && <div className="alert-banner error" style={{ zIndex: 11, position: 'relative' }}>{error}</div>}

        <div className="stats-grid">
          <div className="stat-card" style={{ background: '#f0f4ff', borderColor: '#e0e7ff' }}>
            <div className="stat-val" style={{ color: '#3b82f6' }}>{stats.total}</div>
            <div className="stat-label">{p.total}</div>
          </div>
          <div className="stat-card" style={{ background: '#f0fdf4', borderColor: '#dcfce7' }}>
            <div className="stat-val" style={{ color: '#22c55e' }}>{stats.actifs}</div>
            <div className="stat-label">{p.active}</div>
          </div>
          <div className="stat-card" style={{ background: '#fef2f2', borderColor: '#fee2e2' }}>
            <div className="stat-val" style={{ color: '#ef4444' }}>{stats.admins}</div>
            <div className="stat-label">{p.admins}</div>
          </div>
          <div className="stat-card" style={{ background: '#f0f9ff', borderColor: '#e0f2fe' }}>
            <div className="stat-val" style={{ color: '#0ea5e9' }}>{stats.modifs}</div>
            <div className="stat-label">{p.modifiers}</div>
          </div>
          <div className="stat-card" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
            <div className="stat-val" style={{ color: '#f59e0b' }}>{stats.consul}</div>
            <div className="stat-label">{p.consultation}</div>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>{p.tableUser}</th>
                <th>{p.tableEmail}</th>
                <th>{p.tableRole}</th>
                <th>{p.tableStatus}</th>
                <th>{p.tableCreated}</th>
                <th>{p.tableActions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Chargement...</td></tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-icon">👥</div>
                      <div>{p.noUsers}</div>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className={!u.is_active ? 'inactive-row' : ''}>
                    <td>
                      <div className="u-name">{u.nom}</div>
                    </td>
                    <td><div className="u-email">{u.email}</div></td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>
                        {u.role === 'admin' ? 'Administrateur' : u.role === 'modification' ? 'Modification' : 'Consultation'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-dot ${u.is_active ? 'active' : 'inactive'}`}></span>
                      {u.is_active ? p.statusActive : p.statusInactive}
                    </td>
                    <td className="u-date">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="u-actions">
                        <button className="btn-icon" onClick={() => openEditModal(u)} title={p.editUser}>✏️</button>
                        <button className="btn-icon" onClick={() => handleToggleActive(u)} title={u.is_active ? p.deactivate : p.activate}>
                          {u.is_active ? '🔴' : '🟢'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h2>{editUser ? p.editUser : p.createUser}</h2>
            {formError && <div className="alert-banner error" style={{ marginBottom: '16px' }}>{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{p.fullName}</label>
                <input required type="text" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{p.emailAddress}</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{p.passwordLabel}</label>
                <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder={editUser ? p.pwdHintEdit : p.pwdHintCreate} required={!editUser} minLength="6" />
              </div>
              <div className="form-group">
                <label>{p.roleLabel}</label>
                <div className="select-wrapper">
                  <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                    <option value="consultation">👁️ {p.roleConsultation}</option>
                    <option value="modification">✏️ {p.roleModification}</option>
                    <option value="admin">👑 {p.roleAdmin}</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{p.cancel}</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '...' : p.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .us-page { flex:1; background:#f4f6f3; font-family:'DM Sans', sans-serif; min-height:100vh; -webkit-font-smoothing: antialiased; }
        
        /* ══ HERO ══ */
        .us-hero {
          position: relative;
          height: 210px;
          background: linear-gradient(135deg, #1a3a1f 0%, #2d6a35 50%, #3a8c45 100%);
          overflow: hidden;
        }
        .us-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            radial-gradient(ellipse 50% 60% at 80% 10%, rgba(255,255,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 5% 90%,  rgba(0,0,0,0.12) 0%, transparent 50%);
        }
        .us-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.3) 100%);
        }
        .us-hero-body {
          position: relative; z-index: 2;
          padding: 28px 32px 0;
        }
        .us-crumb {
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
        .us-hero-title {
          font-size: 2rem; font-weight: 700;
          color: white; letter-spacing: -0.5px;
          line-height: 1.15; margin-bottom: 4px;
        }
        .us-hero-sub {
          font-size: 0.8rem; color: rgba(255,255,255,0.65);
          margin-bottom: 20px;
        }

        .us-content { padding: 20px 28px 48px; display: flex; flex-direction: column; gap: 20px; }
        
        .stats-grid { 
          display: flex; gap: 16px; flex-wrap: wrap; 
          margin-top: -48px; position: relative; z-index: 10;
        }
        .stat-card { 
          flex: 1; min-width: 140px; border-radius: 16px; padding: 18px 20px; text-align: center; 
          border: 1px solid transparent; box-shadow: 0 4px 14px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .stat-val { font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; line-height: 1; }
        .stat-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #555; }
        
        .users-table-container { background: white; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.03); margin-top: 10px; }
        .users-table { width: 100%; border-collapse: collapse; text-align: left; }
        .users-table th { background: #f9fafb; padding: 16px 24px; font-size: 0.75rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; }
        .users-table td { padding: 16px 24px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
        .users-table tr:hover:not(.inactive-row) { background: #fdfdfd; }
        .inactive-row { opacity: 0.6; background: #fafafa; }

        
        .u-name { font-weight:600; color:#111827; font-size:0.9rem; }
        .u-email { color:#6b7280; font-size:0.85rem; }
        .u-date { color:#6b7280; font-size:0.85rem; }
        
        .role-badge { display:inline-block; padding:4px 10px; border-radius:20px; font-size:0.75rem; font-weight:600; }
        .role-admin { background:#fee2e2; color:#b91c1c; }
        .role-modification { background:#e0f2fe; color:#0369a1; }
        .role-consultation { background:#fef3c7; color:#b45309; }
        
        .status-dot { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:8px; }
        .status-dot.active { background:#22c55e; box-shadow:0 0 0 2px #dcfce7; }
        .status-dot.inactive { background:#9ca3af; }
        
        .u-actions { display:flex; gap:8px; }
        .btn-icon { background:none; border:none; cursor:pointer; padding:6px; border-radius:6px; font-size:1.1rem; transition:0.2s; }
        .btn-icon:hover { background:#f3f4f6; }
        
        .empty-state { text-align:center; padding:60px 20px; color:#9ca3af; font-size:0.9rem; }
        .empty-icon { font-size:3rem; margin-bottom:12px; opacity:0.5; }
        
        /* Modal */
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:100; }
        .modal-content { background:white; width:100%; max-width:440px; border-radius:16px; padding:32px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.1); }
        .modal-close { position:absolute; top:20px; right:20px; background:none; border:none; font-size:1.5rem; color:#9ca3af; cursor:pointer; }
        .modal-content h2 { margin:0 0 24px; font-size:1.4rem; color:#111827; }
        
        .form-group { margin-bottom:16px; }
        .form-group label { display:block; font-size:0.75rem; font-weight:700; color:#4b5563; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
        .form-group input, .form-group select { width:100%; padding:10px 14px; border:1px solid #d1d5db; border-radius:8px; font-size:0.9rem; font-family:inherit; outline:none; transition:0.2s; }
        .form-group input:focus, .form-group select:focus { border-color:#22c55e; box-shadow:0 0 0 3px rgba(34,197,94,0.1); }
        
        .modal-actions { display:flex; justify-content:flex-end; gap:12px; margin-top:28px; }
        
        .btn { padding:10px 20px; border-radius:10px; font-weight:600; font-size:0.9rem; cursor:pointer; border:none; transition:0.2s; font-family: 'DM Sans', sans-serif; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-primary { background:#1a4a26; color:white; }
        .btn-primary:hover { background:#2b7e3b; transform: translateY(-1px); }
        .btn-secondary { background:white; color:#4b5563; border:1px solid #d1d5db; }
        .btn-secondary:hover { background:#f9fafb; border-color: #9ca3af; color: #111827; }
        
        .alert-banner { padding:12px 16px; border-radius:10px; font-size:0.85rem; font-weight:500; margin-bottom:20px; }
        .alert-banner.error { background:#fee2e2; color:#991b1b; border:1px solid #fecaca; }

        @media (max-width: 768px) {
          .us-hero { height: 200px; }
          .us-hero-body { padding: 20px 20px 0; }
          .us-hero-title { font-size: 1.6rem; }
          .us-content { padding: 14px 16px 36px; }
          .stats-grid { margin-top: -36px; }
        }

      `}</style>
    </div>
  );
};

export default Utilisateurs;
