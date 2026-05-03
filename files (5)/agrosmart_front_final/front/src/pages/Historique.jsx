import { useEffect, useState, useCallback } from 'react'
import { getAlertes, resoudreAlerte, getHistoriqueActions } from '../services/api'

const Historique = ({ setAlertCount }) => {
  const [onglet,   setOnglet]   = useState('alertes')
  const [alertes,  setAlertes]  = useState([])
  const [actions,  setActions]  = useState([])
  const [filtre,   setFiltre]   = useState('toutes')   // toutes | actives | resolues
  const [loading,  setLoading]  = useState(true)
  const [resolving,setResolving]= useState({})

  const charger = useCallback(async () => {
    setLoading(true)
    try {
      const [rA, rAct] = await Promise.all([
        getAlertes(null),
        getHistoriqueActions(200),
      ])
      setAlertes(rA.data)
      setActions(rAct.data)
      const actives = rA.data.filter(a => !a.resolue).length
      setAlertCount && setAlertCount(actives)
    } catch { /* silencieux */ }
    finally { setLoading(false) }
  }, [setAlertCount])

  useEffect(() => { charger() }, [charger])

  const resoudre = async (id) => {
    setResolving(p => ({ ...p, [id]: true }))
    try {
      await resoudreAlerte(id)
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

  const fmt = iso => new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  // Export CSV
  const exportCSV = () => {
    const data = onglet === 'alertes' ? alertesFiltrees : actions
    const headers = onglet === 'alertes'
      ? ['ID','Type','Valeur','Seuil','Message','Résolue','Timestamp']
      : ['ID','Actionneur','Commande','Source','User ID','Timestamp']
    const rows = data.map(r => onglet === 'alertes'
      ? [r.id, r.type_mesure, r.valeur, r.seuil, `"${r.message}"`, r.resolue ? 'Oui' : 'Non', fmt(r.timestamp)]
      : [r.id, r.actionneur, r.commande ? 'ON' : 'OFF', r.source, r.user_id || '', fmt(r.timestamp)]
    )
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `agrosmart_${onglet}_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = {
    total:   alertes.length,
    actives: alertes.filter(a => !a.resolue).length,
    resolues:alertes.filter(a =>  a.resolue).length,
  }

  return (
    <div className="page-main">
      <div className="topbar">
        <div className="topbar-left">
          <h1>Historique</h1>
          <p>Journal des alertes et des actions déclenchées</p>
        </div>
        <div className="topbar-right">
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exporter CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={charger}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="histo-stats">
          {[
            { label: 'Total alertes',   val: stats.total,   color: 'var(--blue)',        bg: '#eff6ff' },
            { label: 'Actives',         val: stats.actives, color: 'var(--red)',          bg: '#fff5f5' },
            { label: 'Résolues',        val: stats.resolues,color: 'var(--green-600)',    bg: 'var(--green-50)' },
            { label: 'Actions',         val: actions.length,color: 'var(--amber)',         bg: '#fffbeb' },
          ].map(s => (
            <div key={s.label} className="histo-stat" style={{ background: s.bg, borderLeft: `3px solid ${s.color}` }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: s.color, lineHeight: 1 }}>
                {s.val}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div className="histo-tabs-wrap">
          <div className="histo-tabs">
            {[
              { id: 'alertes',  label: '🚨 Alertes' },
              { id: 'actions',  label: '⚡ Actions' },
            ].map(t => (
              <button key={t.id} className={`histo-tab ${onglet === t.id ? 'active' : ''}`} onClick={() => setOnglet(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {onglet === 'alertes' && (
            <div className="histo-filters">
              {[
                { id: 'toutes',   label: 'Toutes' },
                { id: 'actives',  label: 'Actives' },
                { id: 'resolues', label: 'Résolues' },
              ].map(f => (
                <button key={f.id} className={`btn btn-sm ${filtre === f.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltre(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="loading-wrap"><div className="spinner"/>Chargement...</div>
        ) : (
          <div className="histo-list card">
            {onglet === 'alertes' && (
              alertesFiltrees.length === 0 ? (
                <div className="empty-state"><span className="icon">✅</span><p>Aucune alerte correspondante</p></div>
              ) : alertesFiltrees.map((a, i) => (
                <div key={a.id} className={`histo-row ${i % 2 === 0 ? '' : 'alt'}`}>
                  <div className="histo-row-icon">
                    {a.resolue ? '✅' : '🚨'}
                  </div>
                  <div className="histo-row-body">
                    <div className="histo-row-msg">{a.message}</div>
                    <div className="histo-row-meta">
                      <span className="histo-tag">{a.type_mesure}</span>
                      <span className="histo-val" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {a.valeur} → seuil {a.seuil}
                      </span>
                    </div>
                  </div>
                  <div className="histo-row-right">
                    <span className={`badge ${a.resolue ? 'badge-green' : 'badge-red'}`}>
                      {a.resolue ? 'Résolue' : 'Active'}
                    </span>
                    <div className="histo-time">{fmt(a.timestamp)}</div>
                    {!a.resolue && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => resoudre(a.id)}
                        disabled={resolving[a.id]}
                      >
                        {resolving[a.id] ? '...' : 'Résoudre'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {onglet === 'actions' && (
              actions.length === 0 ? (
                <div className="empty-state"><span className="icon">📭</span><p>Aucune action enregistrée</p></div>
              ) : actions.map((a, i) => (
                <div key={a.id} className={`histo-row ${i % 2 === 0 ? '' : 'alt'}`}>
                  <div className="histo-row-icon">⚡</div>
                  <div className="histo-row-body">
                    <div className="histo-row-msg">
                      <strong style={{ textTransform: 'capitalize' }}>{a.actionneur}</strong>
                      {' '}— {a.commande ? 'Allumé (ON)' : 'Éteint (OFF)'}
                    </div>
                    <div className="histo-row-meta">
                      <span className="histo-tag">{a.source}</span>
                      {a.user_id && <span className="histo-tag">User #{a.user_id}</span>}
                    </div>
                  </div>
                  <div className="histo-row-right">
                    <span className={`badge ${a.commande ? 'badge-green' : 'badge-gray'}`}>
                      {a.commande ? 'ON' : 'OFF'}
                    </span>
                    <div className="histo-time">{fmt(a.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        .histo-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 14px;
          margin-bottom: 24px;
        }
        .histo-stat {
          padding: 16px 18px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }
        .histo-tabs-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .histo-tabs {
          display: flex;
          gap: 4px;
          background: var(--surface-2);
          padding: 4px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }
        .histo-tab {
          padding: 7px 18px;
          border-radius: 10px;
          border: none;
          background: transparent;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-3);
          cursor: pointer;
          transition: all 0.18s;
        }
        .histo-tab.active {
          background: white;
          color: var(--green-700);
          box-shadow: var(--shadow-sm);
        }
        .histo-filters { display: flex; gap: 6px; flex-wrap: wrap; }
        .histo-list { overflow: hidden; }
        .histo-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
        }
        .histo-row:last-child { border-bottom: none; }
        .histo-row:hover { background: var(--green-50); }
        .histo-row.alt { background: var(--surface-2); }
        .histo-row.alt:hover { background: var(--green-50); }
        .histo-row-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: 2px; }
        .histo-row-body { flex: 1; min-width: 0; }
        .histo-row-msg { font-weight: 600; font-size: 0.875rem; color: var(--text-1); }
        .histo-row-meta { display: flex; align-items: center; gap: 8px; margin-top: 5px; flex-wrap: wrap; }
        .histo-tag {
          font-size: 0.68rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2px 9px;
          color: var(--text-2);
          font-weight: 500;
        }
        .histo-val { font-size: 0.72rem; color: var(--text-3); }
        .histo-row-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
          flex-shrink: 0;
          min-width: 120px;
        }
        .histo-time {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          color: var(--text-4);
        }
      `}</style>
    </div>
  )
}

export default Historique
