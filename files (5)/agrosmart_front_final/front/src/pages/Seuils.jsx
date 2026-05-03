import { useEffect, useState } from 'react'
import { getSeuils, modifierSeuil } from '../services/api'
import { useAuth } from '../context/AuthContext'

const LABELS = {
  temperature:  { label: 'Température',    icon: '🌡️', color: '#ef4444' },
  humidite_sol: { label: 'Humidité Sol',   icon: '💧', color: '#3b82f6' },
  humidite_air: { label: 'Humidité Air',   icon: '🌬️', color: '#06b6d4' },
  co2:          { label: 'CO₂',            icon: '🫧', color: '#8b5cf6' },
  luminosite:   { label: 'Luminosité',     icon: '☀️', color: '#f59e0b' },
  niveau_eau:   { label: "Niveau d'eau",   icon: '🪣', color: '#14b8a6' },
}

const Seuils = () => {
  const { isModification } = useAuth()
  const [seuils,  setSeuils]  = useState([])
  const [edits,   setEdits]   = useState({})
  const [saving,  setSaving]  = useState({})
  const [saved,   setSaved]   = useState({})
  const [erreur,  setErreur]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSeuils()
      .then(res => {
        setSeuils(res.data)
        const init = {}
        res.data.forEach(s => {
          init[s.type_mesure] = { min: s.valeur_min ?? '', max: s.valeur_max ?? '', actif: s.actif ?? true }
        })
        setEdits(init)
      })
      .catch(() => setErreur('Impossible de charger les seuils.'))
      .finally(() => setLoading(false))
  }, [])

  const set = (type, field, val) =>
    setEdits(p => ({ ...p, [type]: { ...p[type], [field]: val } }))

  const sauvegarder = async (type) => {
    if (!isModification) return
    setSaving(p => ({ ...p, [type]: true }))
    try {
      const e = edits[type]
      await modifierSeuil(type, {
        valeur_min: e.min !== '' ? parseFloat(e.min) : null,
        valeur_max: e.max !== '' ? parseFloat(e.max) : null,
        actif: e.actif,
      })
      setSaved(p => ({ ...p, [type]: true }))
      setTimeout(() => setSaved(p => ({ ...p, [type]: false })), 2500)
    } catch {
      setErreur('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(p => ({ ...p, [type]: false }))
    }
  }

  return (
    <div className="page-main">
      <div className="topbar">
        <div className="topbar-left">
          <h1>Seuils d'alerte</h1>
          <p>{isModification ? 'Définissez les limites min/max déclenchant les alertes automatiques' : '👁️ Mode lecture seule'}</p>
        </div>
        {!isModification && (
          <div className="topbar-right">
            <span className="badge badge-amber">Consultation uniquement</span>
          </div>
        )}
      </div>
      <div className="page-content">
        {erreur && <div className="alert-banner error">{erreur}</div>}

        {!isModification && (
          <div className="alert-banner" style={{ marginBottom: 24 }}>
            <span>ℹ️</span>
            <span>Votre rôle <strong>consultation</strong> ne permet que la visualisation des seuils.</span>
          </div>
        )}

        {isModification && (
          <div className="alert-banner" style={{ marginBottom: 24 }}>
            <span>ℹ️</span>
            <span>Quand une mesure dépasse ces limites, une alerte est créée automatiquement.</span>
          </div>
        )}

        {loading ? (
          <div className="loading-wrap"><div className="spinner"/>Chargement...</div>
        ) : (
          <div className="seuils-grid">
            {seuils.map(s => {
              const meta = LABELS[s.type_mesure] || { label: s.type_mesure, icon: '📊', color: '#6b7280' }
              const edit = edits[s.type_mesure] || {}
              return (
                <div key={s.type_mesure} className="seuil-card" style={{ borderTop: `3px solid ${meta.color}` }}>
                  <div className="seuil-header">
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:'1.6rem' }}>{meta.icon}</span>
                      <div>
                        <div className="seuil-title">{meta.label}</div>
                        <div className="seuil-unit">{s.unite}</div>
                      </div>
                    </div>
                    {isModification ? (
                      <label className="toggle">
                        <input type="checkbox" checked={edit.actif ?? true}
                          onChange={e => set(s.type_mesure, 'actif', e.target.checked)}/>
                        <span className="toggle-slider"/>
                      </label>
                    ) : (
                      <span className={`badge ${s.actif ? 'badge-green' : 'badge-gray'}`}>
                        {s.actif ? 'Actif' : 'Inactif'}
                      </span>
                    )}
                  </div>

                  <div className="seuil-fields">
                    <div className="form-field">
                      <label className="form-label">Min ({s.unite})</label>
                      <input className="form-input" type="number" step="0.1"
                        value={edit.min ?? ''} placeholder="Pas de limite"
                        onChange={e => set(s.type_mesure, 'min', e.target.value)}
                        disabled={!isModification || !edit.actif}
                        readOnly={!isModification}/>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Max ({s.unite})</label>
                      <input className="form-input" type="number" step="0.1"
                        value={edit.max ?? ''} placeholder="Pas de limite"
                        onChange={e => set(s.type_mesure, 'max', e.target.value)}
                        disabled={!isModification || !edit.actif}
                        readOnly={!isModification}/>
                    </div>
                  </div>

                  {isModification ? (
                    <button
                      className={`btn ${saved[s.type_mesure] ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ width:'100%', justifyContent:'center', marginTop:4 }}
                      onClick={() => sauvegarder(s.type_mesure)}
                      disabled={saving[s.type_mesure] || !edit.actif}
                    >
                      {saved[s.type_mesure]   ? '✅ Sauvegardé'
                      : saving[s.type_mesure] ? <><span className="spinner" style={{width:14,height:14}}/>Sauvegarde...</>
                      : 'Sauvegarder'}
                    </button>
                  ) : (
                    <div style={{ marginTop:8, padding:'8px', background:'var(--surface-2)', borderRadius:'var(--radius-sm)', textAlign:'center', fontSize:'0.78rem', color:'var(--text-3)' }}>
                      🔒 Accès lecture seule
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <style>{`
        .seuils-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:18px; }
        .seuil-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:20px; box-shadow:var(--shadow-xs); transition:box-shadow 0.2s; }
        .seuil-card:hover { box-shadow:var(--shadow-sm); }
        .seuil-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; padding-bottom:16px; border-bottom:1px solid var(--border); }
        .seuil-title { font-weight:700; font-size:0.95rem; color:var(--text-1); }
        .seuil-unit { font-size:0.7rem; color:var(--text-3); font-family:'JetBrains Mono',monospace; margin-top:2px; }
        .seuil-fields { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }
      `}</style>
    </div>
  )
}

export default Seuils
