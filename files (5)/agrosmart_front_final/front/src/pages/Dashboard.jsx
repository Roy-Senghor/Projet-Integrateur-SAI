import { useEffect, useState, useCallback } from 'react'
import { getDernieresMesures, getAlertes, getEtatActionneurs } from '../services/api'

const SENSORS = {
  temperature:  { label: 'Température',   icon: '🌡️', unit: '°C',  color: '#ef4444', bg: '#fff5f5' },
  humidite_sol: { label: 'Humidité Sol',  icon: '💧', unit: '%',   color: '#3b82f6', bg: '#eff6ff' },
  humidite_air: { label: 'Humidité Air',  icon: '🌬️', unit: '%',   color: '#06b6d4', bg: '#f0fdfe' },
  co2:          { label: 'CO₂',           icon: '🫧', unit: 'ppm', color: '#8b5cf6', bg: '#f5f3ff' },
  luminosite:   { label: 'Luminosité',    icon: '☀️', unit: 'lux', color: '#f59e0b', bg: '#fffbeb' },
  niveau_eau:   { label: 'Niveau d\'eau', icon: '🪣', unit: '%',   color: '#14b8a6', bg: '#f0fdfa' },
}

const ACTIONNEURS = {
  pompe:       { label: 'Pompe irrigation', icon: '💧' },
  ventilation: { label: 'Ventilation',      icon: '🌬️' },
  eclairage:   { label: 'Éclairage LED',    icon: '💡' },
}

const Topbar = ({ onLogout }) => {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1>Dashboard</h1>
        <p>Surveillance en temps réel des capteurs</p>
      </div>
      <div className="topbar-right">
        <div className="topbar-time">
          <span className="live-dot"/>
          {time.toLocaleTimeString('fr-FR')}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onLogout}>Déconnexion</button>
      </div>
    </div>
  )
}

const StatCard = ({ label, value, delta, icon, color, bg, unit }) => (
  <div className="sensor-card" style={{ borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ width: 44, height: 44, background: bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
        {icon}
      </div>
      <span style={{ fontSize: '0.68rem', fontWeight: 700, background: bg, color, padding: '3px 9px', borderRadius: 20 }}>
        {label}
      </span>
    </div>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '2rem', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1 }}>
      {value !== null && value !== undefined ? value : '—'}
      <span style={{ fontSize: '0.95rem', fontWeight: 400, color: 'var(--text-3)', marginLeft: 4 }}>{unit}</span>
    </div>
    <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 6 }}>Dernière mesure</div>
  </div>
)

const Dashboard = ({ onLogout, setAlertCount }) => {
  const [mesures,    setMesures]    = useState([])
  const [alertes,    setAlertes]    = useState([])
  const [actionneurs,setActionneurs]= useState([])
  const [loading,    setLoading]    = useState(true)
  const [erreur,     setErreur]     = useState(null)

  const charger = useCallback(async () => {
    try {
      const [resMesures, resAlertes, resAct] = await Promise.all([
        getDernieresMesures(),
        getAlertes(true),
        getEtatActionneurs(),
      ])
      setMesures(resMesures.data)
      setAlertes(resAlertes.data)
      setActionneurs(resAct.data)
      setAlertCount && setAlertCount(resAlertes.data.length)
      setErreur(null)
    } catch {
      setErreur('Impossible de contacter le serveur backend.')
    } finally {
      setLoading(false)
    }
  }, [setAlertCount])

  useEffect(() => {
    charger()
    const t = setInterval(charger, 5000)
    return () => clearInterval(t)
  }, [charger])

  return (
    <div className="page-main">
      <Topbar onLogout={onLogout} />
      <div className="page-content">

        {erreur && <div className="alert-banner error">{erreur}</div>}

        {/* Alertes actives */}
        {alertes.length > 0 && (
          <div className="alert-banner" style={{ marginBottom: 24 }}>
            <span style={{ fontSize: '1.1rem' }}>🚨</span>
            <span><strong>{alertes.length} alerte{alertes.length > 1 ? 's' : ''} active{alertes.length > 1 ? 's' : ''}</strong> — consultez la page Historique pour les résoudre.</span>
          </div>
        )}

        {/* Capteurs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-3)' }}>
            Capteurs — {mesures.length} actifs
          </h2>
          {loading && <div className="spinner"/>}
        </div>

        {loading && mesures.length === 0 ? (
          <div className="loading-wrap"><div className="spinner"/>Chargement des données...</div>
        ) : mesures.length === 0 ? (
          <div className="card" style={{ padding: 40 }}>
            <div className="empty-state">
              <span className="icon">📡</span>
              <p>Aucune mesure reçue pour l'instant.<br/>Les capteurs IoT enverront les données ici.</p>
            </div>
          </div>
        ) : (
          <div className="sensors-grid">
            {mesures.map(m => {
              const meta = SENSORS[m.type_mesure] || { label: m.type_mesure, icon: '📊', unit: m.unite, color: '#6b7280', bg: '#f9fafb' }
              return (
                <StatCard
                  key={m.id}
                  label={meta.label}
                  value={m.valeur}
                  unit={m.unite || meta.unit}
                  icon={meta.icon}
                  color={meta.color}
                  bg={meta.bg}
                />
              )
            })}
          </div>
        )}

        {/* Actionneurs rapides */}
        <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-3)', marginTop: 32, marginBottom: 16 }}>
          État des actionneurs
        </h2>
        <div className="actionneurs-strip">
          {Object.entries(ACTIONNEURS).map(([id, meta]) => {
            const etat = actionneurs.find(a => a.actionneur === id)
            const on   = etat?.commande === true
            return (
              <div key={id} className={`act-strip-item ${on ? 'on' : 'off'}`}>
                <span style={{ fontSize: '1.4rem' }}>{meta.icon}</span>
                <div>
                  <div className="act-strip-name">{meta.label}</div>
                  <div className="act-strip-state">{on ? '● En marche' : '○ Arrêté'}</div>
                </div>
                <span className={`badge ${on ? 'badge-green' : 'badge-gray'}`} style={{ marginLeft: 'auto' }}>
                  {on ? 'ON' : 'OFF'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Alertes récentes */}
        {alertes.length > 0 && (
          <>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-3)', marginTop: 32, marginBottom: 16 }}>
              Alertes récentes
            </h2>
            <div className="card">
              {alertes.slice(0, 5).map((a, i) => (
                <div key={a.id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: i < Math.min(alertes.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: '1.1rem' }}>🚨</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.message}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 2 }}>
                      {a.type_mesure} · {new Date(a.timestamp).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <span className="badge badge-red">Actif</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        .sensors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 8px;
        }
        .sensor-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 18px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .sensor-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .actionneurs-strip {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 12px;
        }
        .act-strip-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--surface);
          transition: all 0.2s;
        }
        .act-strip-item.on { border-color: #a7f3d0; background: #f0fdf4; }
        .act-strip-name { font-weight: 600; font-size: 0.875rem; }
        .act-strip-state { font-size: 0.72rem; color: var(--text-3); margin-top: 2px; }
        .act-strip-item.on .act-strip-state { color: var(--green-600); }
      `}</style>
    </div>
  )
}

export default Dashboard
