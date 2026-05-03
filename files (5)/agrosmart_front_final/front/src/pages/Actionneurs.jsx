import { useEffect, useState } from 'react'
import { getEtatActionneurs, envoyerCommande } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ACTIONNEURS = [
  { id: 'pompe',       label: 'Pompe Irrigation', icon: '💧', desc: "Contrôle l'arrosage automatique des cultures" },
  { id: 'ventilation', label: 'Ventilation',       icon: '🌬️', desc: 'Régulation température et taux de CO₂' },
  { id: 'eclairage',   label: 'Éclairage LED',     icon: '💡', desc: 'Apport lumineux pour la croissance des plantes' },
]

const Actionneurs = () => {
  const { isModification } = useAuth()
  const [etats,   setEtats]   = useState({ pompe: false, ventilation: false, eclairage: false })
  const [loading, setLoading] = useState({})
  const [erreur,  setErreur]  = useState(null)
  const [success, setSuccess] = useState(null)
  const [init,    setInit]    = useState(true)

  useEffect(() => {
    getEtatActionneurs()
      .then(res => {
        const e = { pompe: false, ventilation: false, eclairage: false }
        res.data.forEach(a => { e[a.actionneur] = a.commande })
        setEtats(e)
      })
      .catch(() => setErreur("Impossible de charger l'état des actionneurs."))
      .finally(() => setInit(false))
  }, [])

  const basculer = async (id) => {
    if (!isModification) return
    setLoading(p => ({ ...p, [id]: true }))
    setErreur(null); setSuccess(null)
    const cmd = !etats[id]
    try {
      await envoyerCommande(id, cmd)
      setEtats(p => ({ ...p, [id]: cmd }))
      const act = ACTIONNEURS.find(a => a.id === id)
      setSuccess(`${act.label} ${cmd ? 'activée' : 'désactivée'} avec succès`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (e) {
      setErreur(e.response?.data?.detail || 'Erreur lors de la commande.')
    } finally {
      setLoading(p => ({ ...p, [id]: false }))
    }
  }

  return (
    <div className="page-main">
      <div className="topbar">
        <div className="topbar-left">
          <h1>Actionneurs</h1>
          <p>{isModification ? 'Contrôle manuel des équipements agricoles' : '👁️ Mode lecture seule — vous ne pouvez pas commander les actionneurs'}</p>
        </div>
        {!isModification && (
          <div className="topbar-right">
            <span className="badge badge-amber">Consultation uniquement</span>
          </div>
        )}
      </div>
      <div className="page-content">
        {!isModification && (
          <div className="alert-banner" style={{ marginBottom: 24 }}>
            <span>ℹ️</span>
            <span>Votre rôle <strong>consultation</strong> ne permet que la visualisation. Contactez un administrateur pour modifier les actionneurs.</span>
          </div>
        )}

        {erreur  && <div className="alert-banner error">{erreur}</div>}
        {success && <div className="alert-banner success">✅ {success}</div>}

        {init ? (
          <div className="loading-wrap"><div className="spinner"/>Chargement...</div>
        ) : (
          <>
            <div className="act-summary">
              {[
                { label: 'Actifs',   val: Object.values(etats).filter(Boolean).length,  color: 'var(--green-600)', bg: 'var(--green-50)' },
                { label: 'Arrêtés', val: Object.values(etats).filter(v => !v).length,   color: 'var(--text-3)',    bg: 'var(--surface-2)' },
                { label: 'Total',   val: ACTIONNEURS.length,                             color: 'var(--blue)',      bg: '#eff6ff' },
              ].map(s => (
                <div key={s.label} className="act-stat" style={{ background: s.bg }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="act-grid">
              {ACTIONNEURS.map(act => {
                const on = etats[act.id]
                return (
                  <div key={act.id} className={`act-card ${on ? 'act-on' : 'act-off'}`}>
                    <div className="act-card-top">
                      <div className={`act-icon-wrap ${on ? 'on' : 'off'}`}>
                        <span style={{ fontSize: '2rem' }}>{act.icon}</span>
                      </div>
                      <span className={`badge ${on ? 'badge-green' : 'badge-gray'}`}>
                        {on ? '● EN MARCHE' : '○ ARRÊTÉ'}
                      </span>
                    </div>
                    <h3 className="act-name">{act.label}</h3>
                    <p className="act-desc">{act.desc}</p>

                    {isModification ? (
                      <button
                        className={`btn btn-lg ${on ? 'btn-danger' : 'btn-primary'}`}
                        style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                        onClick={() => basculer(act.id)}
                        disabled={loading[act.id]}
                      >
                        {loading[act.id]
                          ? <><span className="spinner" style={{width:16,height:16}}/>Commande...</>
                          : on ? 'Éteindre' : 'Allumer'}
                      </button>
                    ) : (
                      <div style={{ marginTop: 16, padding: '10px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-3)' }}>
                        🔒 Accès lecture seule
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
      <style>{`
        .act-summary { display:flex; gap:14px; margin-bottom:28px; flex-wrap:wrap; }
        .act-stat { flex:1; min-width:100px; padding:18px 20px; border-radius:var(--radius-md); border:1px solid var(--border); text-align:center; }
        .act-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
        .act-card { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:22px; transition:all 0.2s; box-shadow:var(--shadow-xs); }
        .act-card:hover { box-shadow:var(--shadow-md); transform:translateY(-2px); }
        .act-card.act-on { border-color:#a7f3d0; background:linear-gradient(160deg,#f0fdf4,white); }
        .act-card-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .act-icon-wrap { width:60px; height:60px; border-radius:18px; display:flex; align-items:center; justify-content:center; }
        .act-icon-wrap.on { background:#d1fae5; } .act-icon-wrap.off { background:var(--surface-2); }
        .act-name { font-size:1.05rem; font-weight:700; color:var(--text-1); margin-bottom:6px; }
        .act-desc { font-size:0.8rem; color:var(--text-3); line-height:1.5; }
      `}</style>
    </div>
  )
}

export default Actionneurs
