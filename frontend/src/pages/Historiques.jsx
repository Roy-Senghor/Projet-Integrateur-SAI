import { useEffect, useState, useCallback } from 'react'
import api from '../services/api'
import { useLanguage } from '../context/LanguageContext'

const Historique = ({ setAlertCount }) => {
  const { t, tObj } = useLanguage()
  const p = tObj.historiquesPage || {}
  
  const [onglet,    setOnglet]    = useState('alertes')
  const [alertes,   setAlertes]   = useState([])
  const [actions,   setActions]   = useState([])
  const [filtre,    setFiltre]    = useState('toutes')
  const [loading,   setLoading]   = useState(true)
  const [resolving, setResolving] = useState({})
  const [page,      setPage]      = useState(1)
  const perPage = 10

  const charger = useCallback(async () => {
    setLoading(true)
    try {
      const [rA, rAct] = await Promise.all([
        api.get('/alertes?non_resolues=false'),
        api.get('/actionneurs/historique?limit=200'),
      ])
      setAlertes(rA.data)
      setActions(rAct.data)
      const actives = rA.data.filter(a => !a.resolue).length
      setAlertCount && setAlertCount(actives)
    } catch (e) { console.error('Erreur chargement historique:', e) }
    finally { setLoading(false) }
  }, [setAlertCount])

  useEffect(() => { charger() }, [charger])

  const resoudre = async (id) => {
    setResolving(p => ({ ...p, [id]: true }))
    try {
      await api.patch(`/alertes/${id}/resoudre`)
      setAlertes(p => p.map(a => a.id === id ? { ...a, resolue: true } : a))
      const actives = alertes.filter(a => a.id !== id && !a.resolue).length
      setAlertCount && setAlertCount(actives)
    } catch { /* silencieux */ }
    finally { setResolving(p => ({ ...p, [id]: false })) }
  }

  const alertesFiltrees = alertes.filter(a => {
    if (filtre === 'actives')  return !a.resolue
    if (filtre === 'resolues') return a.resolue
    return true
  })

  const currentList = onglet === 'alertes' ? alertesFiltrees : actions
  const totalPages  = Math.max(1, Math.ceil(currentList.length / perPage))
  const startIdx    = (page - 1) * perPage
  const paginated   = currentList.slice(startIdx, startIdx + perPage)

  const fmt = iso => new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const exportCSV = () => {
    const data = onglet === 'alertes' ? alertesFiltrees : actions
    const headers = onglet === 'alertes'
      ? ['ID','Type','Valeur','Seuil','Message','Résolue','Timestamp']
      : ['ID','Actionneur','Commande','Source','User ID','Timestamp']
    const rows = data.map(r => onglet === 'alertes'
      ? [r.id, r.type_mesure, r.valeur, r.seuil, `"${r.message}"`, r.resolue ? (p.yes || 'Oui') : (p.no || 'Non'), fmt(r.timestamp)]
      : [r.id, r.actionneur, r.commande ? 'ON' : 'OFF', r.source, r.user_id || '', fmt(r.timestamp)]
    )
    const csv  = [headers, ...rows].map(r => r.join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `agrosmart_${onglet}_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = {
    total:    alertes.length,
    actives:  alertes.filter(a => !a.resolue).length,
    resolues: alertes.filter(a =>  a.resolue).length,
  }

  return (
    <div className="hi-page">

      {/* ══ HERO ══ */}
      <div className="hi-hero">
        <div className="hi-hero-overlay" />
        <div className="hi-hero-body">
          <div className="hi-crumb">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14" fill="none" stroke="white" strokeWidth="2.5"/>
            </svg>
            {p.systemLog || 'Journal système'}
          </div>
          <h1 className="hi-hero-title">{t('historyTitle')}</h1>
          <p className="hi-hero-sub">{t('historySubtitle')}</p>

          {/* stat pills dans le hero */}
          <div className="hi-hero-pills">
            <div className="hi-pill hi-pill-blue">
              <span className="hi-pill-val">{stats.total}</span>
              <span className="hi-pill-label">{p.totalAlerts || 'Total alertes'}</span>
            </div>
            <div className="hi-pill hi-pill-red">
              <span className="hi-pill-val">{stats.actives}</span>
              <span className="hi-pill-label">{p.actives || 'Actives'}</span>
            </div>
            <div className="hi-pill hi-pill-green">
              <span className="hi-pill-val">{stats.resolues}</span>
              <span className="hi-pill-label">{p.resolues || 'Résolues'}</span>
            </div>
            <div className="hi-pill hi-pill-amber">
              <span className="hi-pill-val">{actions.length}</span>
              <span className="hi-pill-label">{t('actions')}</span>
            </div>
          </div>
        </div>

        {/* actions top-right */}
        <div className="hi-hero-actions">
          <button className="hi-action-btn" onClick={exportCSV}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {t('exportCSV')}
          </button>
          <button className="hi-action-btn" onClick={charger}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {t('refresh')}
          </button>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="hi-content">

        {/* ── Onglets + filtres ── */}
        <div className="hi-toolbar">
          <div className="hi-tabs">
            {[
              { id: 'alertes', icon: '🚨', label: t('alerts') },
              { id: 'actions', icon: '⚡', label: t('actions') },
            ].map(tab => (
              <button
                key={tab.id}
                className={`hi-tab ${onglet === tab.id ? 'on' : ''}`}
                onClick={() => setOnglet(tab.id)}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {onglet === 'alertes' && (
            <div className="hi-filters">
              {[
                { id: 'toutes',   label: t('all') },
                { id: 'actives',  label: p.actives || 'Actives' },
                { id: 'resolues', label: p.resolues || 'Résolues' },
              ].map(f => (
                <button
                  key={f.id}
                  className={`hi-filter-btn ${filtre === f.id ? 'on' : ''}`}
                  onClick={() => setFiltre(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Liste ── */}
        {loading ? (
          <div className="hi-loading">
            <div className="hi-spinner" />
            <span>{t('loading')}</span>
          </div>
        ) : (
          <>
            <div className="hi-list">

              {/* ─ Alertes ─ */}
              {onglet === 'alertes' && (
                paginated.length === 0 ? (
                  <div className="hi-empty">
                    <div className="hi-empty-icon">✅</div>
                    <p>{p.noMatchingAlerts || 'Aucune alerte correspondante'}</p>
                  </div>
                ) : paginated.map((a, i) => (
                  <div key={a.id} className={`hi-row ${i % 2 !== 0 ? 'alt' : ''}`}>
                    <div className="hi-row-icon">{a.resolue ? '✅' : '🚨'}</div>
                    <div className="hi-row-body">
                      <div className="hi-row-msg">{a.message}</div>
                      <div className="hi-row-meta">
                        <span className="hi-tag">{a.type_mesure}</span>
                        <span className="hi-mono">{a.valeur} → seuil {a.seuil}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* ─ Actions ─ */}
              {onglet === 'actions' && (
                paginated.length === 0 ? (
                  <div className="hi-empty">
                    <div className="hi-empty-icon">📭</div>
                    <p>{p.noActionsRecorded || 'Aucune action enregistrée'}</p>
                  </div>
                ) : paginated.map((a, i) => (
                  <div key={a.id} className={`hi-row ${i % 2 !== 0 ? 'alt' : ''}`}>
                    <div className="hi-row-icon">⚡</div>
                    <div className="hi-row-body">
                      <div className="hi-row-msg">
                        <strong style={{ textTransform: 'capitalize' }}>{a.actionneur}</strong>
                        {' '}— {a.commande ? (p.turnedOn || 'Allumé (ON)') : (p.turnedOff || 'Éteint (OFF)')}
                      </div>
                      <div className="hi-row-meta">
                        <span className="hi-tag">{a.source}</span>
                        {a.user_id && <span className="hi-tag">User #{a.user_id}</span>}
                      </div>
                    </div>
                    <div className="hi-row-right">
                      <span className={`hi-badge ${a.commande ? 'green' : 'gray'}`}>
                        {a.commande ? 'ON' : 'OFF'}
                      </span>
                      <div className="hi-time">{fmt(a.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}

              {/* ─ Pagination ─ */}
              {!loading && currentList.length > 0 && (
                <div className="hi-paginate">
                  <div className="hi-paginate-info">
                    {startIdx + 1} – {Math.min(startIdx + perPage, currentList.length)} {p.outOf || 'sur'} {currentList.length}
                  </div>
                  <div className="hi-paginate-btns">
                    <button
                      className="hi-paginate-btn"
                      onClick={() => setPage(page => Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      {p.prev || '‹ Précédent'}
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={`hi-paginate-btn ${p === page ? 'on' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      className="hi-paginate-btn"
                      onClick={() => setPage(page => Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                    >
                      {p.next || 'Suivant ›'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .hi-page {
          flex: 1;
          min-height: 100vh;
          background: #f4f6f3;
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ══ HERO ══ */
        .hi-hero {
          position: relative;
          height: 220px;
          background: linear-gradient(135deg, #1a3a1f 0%, #2d6a35 50%, #3a8c45 100%);
          overflow: hidden;
        }
        .hi-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            radial-gradient(ellipse 50% 60% at 85% 15%, rgba(255,255,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 10% 90%, rgba(0,0,0,0.12) 0%, transparent 50%);
        }
        .hi-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.3) 100%);
        }
        .hi-hero-body {
          position: relative; z-index: 2;
          padding: 28px 32px 0;
          height: 100%;
        }
        .hi-crumb {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          padding: 3px 12px;
          font-size: 0.7rem;
          font-weight: 600;
          color: rgba(255,255,255,0.88);
          margin-bottom: 10px;
        }
        .hi-hero-title {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          letter-spacing: -0.5px;
          line-height: 1.15;
          margin-bottom: 4px;
        }
        .hi-hero-sub {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.65);
          margin-bottom: 20px;
        }

        /* stat pills */
        .hi-hero-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .hi-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.18);
        }
        .hi-pill-blue   { background: rgba(59,130,246,0.25); }
        .hi-pill-red    { background: rgba(239,68,68,0.25); }
        .hi-pill-green  { background: rgba(34,197,94,0.25); }
        .hi-pill-amber  { background: rgba(245,158,11,0.25); }
        .hi-pill-val {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1;
        }
        .hi-pill-label {
          font-size: 0.68rem;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* hero action buttons */
        .hi-hero-actions {
          position: absolute;
          top: 24px; right: 28px;
          z-index: 3;
          display: flex;
          gap: 6px;
        }
        .hi-action-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 13px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          font-size: 0.72rem;
          font-weight: 600;
          color: rgba(255,255,255,0.88);
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .hi-action-btn:hover { background: rgba(255,255,255,0.22); color: white; }

        /* ══ CONTENT ══ */
        .hi-content {
          padding: 20px 28px 48px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ── toolbar ── */
        .hi-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .hi-tabs {
          display: flex;
          gap: 3px;
          background: white;
          padding: 3px;
          border-radius: 11px;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .hi-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 18px;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          color: #888;
          cursor: pointer;
          transition: all 0.15s;
        }
        .hi-tab.on {
          background: #1a4a26;
          color: white;
          box-shadow: 0 2px 8px rgba(26,74,38,0.2);
        }
        .hi-tab:not(.on):hover { background: rgba(26,74,38,0.06); color: #1a4a26; }

        .hi-filters {
          display: flex;
          gap: 5px;
        }
        .hi-filter-btn {
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.08);
          background: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.76rem;
          font-weight: 600;
          color: #777;
          cursor: pointer;
          transition: all 0.14s;
        }
        .hi-filter-btn.on {
          background: #1a4a26;
          color: white;
          border-color: #1a4a26;
          box-shadow: 0 2px 8px rgba(26,74,38,0.2);
        }
        .hi-filter-btn:not(.on):hover { background: rgba(26,74,38,0.06); color: #1a4a26; border-color: rgba(26,74,38,0.2); }

        /* ── loading ── */
        .hi-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 60px;
          color: #aaa;
          font-size: 0.85rem;
        }
        .hi-spinner {
          width: 20px; height: 20px;
          border: 2px solid #e5e7eb;
          border-top-color: #1a4a26;
          border-radius: 50%;
          animation: hiSpin 0.7s linear infinite;
        }
        .hi-spinner-sm {
          display: inline-block;
          width: 12px; height: 12px;
          border: 1.5px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: hiSpin 0.7s linear infinite;
        }
        @keyframes hiSpin { to { transform: rotate(360deg); } }

        /* ── empty ── */
        .hi-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 56px 20px;
          color: #bbb;
          gap: 10px;
        }
        .hi-empty-icon { font-size: 2.2rem; }
        .hi-empty p { font-size: 0.85rem; margin: 0; }

        /* ── list ── */
        .hi-list {
          background: white;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .hi-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          transition: background 0.13s;
        }
        .hi-row:last-child { border-bottom: none; }
        .hi-row:hover { background: rgba(26,74,38,0.03); }
        .hi-row.alt { background: #fafafa; }
        .hi-row.alt:hover { background: rgba(26,74,38,0.03); }

        .hi-row-icon {
          font-size: 1.1rem;
          flex-shrink: 0;
          margin-top: 1px;
          width: 28px;
          text-align: center;
        }
        .hi-row-body { flex: 1; min-width: 0; }
        .hi-row-msg {
          font-weight: 600;
          font-size: 0.84rem;
          color: #1a1a1a;
          margin-bottom: 5px;
        }
        .hi-row-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .hi-tag {
          font-size: 0.65rem;
          font-weight: 600;
          background: #f4f6f3;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 20px;
          padding: 2px 9px;
          color: #555;
        }
        .hi-mono {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          color: #aaa;
        }

        .hi-row-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
          flex-shrink: 0;
          min-width: 110px;
        }
        .hi-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .hi-badge.green { background: #dcfce7; color: #166534; }
        .hi-badge.red   { background: #fee2e2; color: #991b1b; }
        .hi-badge.gray  { background: #f3f4f6; color: #6b7280; }
        .hi-time {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          color: #ccc;
        }
        .hi-resolve-btn {
          display: flex; align-items: center; justify-content: center;
          padding: 4px 12px;
          border-radius: 7px;
          border: none;
          background: #1a4a26;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.14s;
          min-width: 70px; min-height: 24px;
          box-shadow: 0 2px 6px rgba(26,74,38,0.2);
        }
        .hi-resolve-btn:hover:not(:disabled) {
          background: #2b7e3b;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(26,74,38,0.25);
        }
        .hi-resolve-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── responsive ── */
        @media (max-width: 768px) {
          .hi-hero { height: 200px; }
          .hi-hero-body { padding: 20px 20px 0; }
          .hi-hero-title { font-size: 1.6rem; }
          .hi-hero-actions { top: 16px; right: 16px; }
          .hi-content { padding: 14px 16px 36px; }
          .hi-pill-label { display: none; }
          .hi-row { padding: 12px 14px; gap: 10px; }
          .hi-row-right { min-width: 90px; }
        }
        @media (max-width: 480px) {
          .hi-hero { height: 180px; }
          .hi-hero-pills { gap: 5px; }
          .hi-pill { padding: 5px 10px; }
          .hi-toolbar { flex-direction: column; align-items: flex-start; }
          .hi-filters { flex-wrap: wrap; }
          .hi-hero-actions { display: none; }
        }

        /* ── pagination styles ── */
        .hi-paginate {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: white;
          border-top: 1px solid rgba(0,0,0,0.05);
          border-radius: 0 0 16px 16px;
        }
        .hi-paginate-info {
          font-size: 0.75rem;
          color: #888;
          font-weight: 500;
        }
        .hi-paginate-btns {
          display: flex;
          gap: 4px;
        }
        .hi-paginate-btn {
          min-width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.06);
          background: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          color: #555;
          cursor: pointer;
          transition: all 0.15s;
        }
        .hi-paginate-btn:hover:not(:disabled) {
          background: #f4f6f3;
          border-color: #1a4a26;
          color: #1a4a26;
        }
        .hi-paginate-btn.on {
          background: #1a4a26;
          color: white;
          border-color: #1a4a26;
          box-shadow: 0 2px 6px rgba(26,74,38,0.2);
        }
        .hi-paginate-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}

export default Historique