import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useLanguage } from '../context/LanguageContext'

/* ─── mapping visuel des actionneurs ─── */
const DEVICE_MAP = {
  pompe: { name: 'Pompe à eau', type: 'Distribution d\'eau', icon: '🌀', color: '#3b82f6', bg: '#eff6ff' },
  lampe: { name: 'Lampe de culture', type: 'Éclairage LED', icon: '💡', color: '#f59e0b', bg: '#fffbeb' },
  ventilateur: { name: 'Ventilateur', type: 'Circulation d\'air', icon: '💨', color: '#6366f1', bg: '#eef2ff' },
  arrosage: { name: 'Irrigation', type: 'Arrosage automatique', icon: '💧', color: '#22c55e', bg: '#f0fdf4' },
}

/* ─── scénarios d'actions rapides ─── */
const SCENARIOS = [
  {
    id: 'all_off',
    icon: '🔴',
    name: 'Tout éteindre',
    sub: 'Mode arrêt complet',
    commands: [
      { actionneur: 'pompe', commande: false },
      { actionneur: 'lampe', commande: false },
      { actionneur: 'ventilateur', commande: false },
    ],
  },
  {
    id: 'night',
    icon: '🌙',
    name: 'Mode nuit',
    sub: 'Lampe OFF, ventilo ON',
    commands: [
      { actionneur: 'lampe', commande: false },
      { actionneur: 'ventilateur', commande: true },
    ],
  },
  {
    id: 'eco',
    icon: '🌿',
    name: 'Économie d\'énergie',
    sub: 'Minimum vital',
    commands: [
      { actionneur: 'lampe', commande: false },
      { actionneur: 'ventilateur', commande: false },
      { actionneur: 'pompe', commande: false },
    ],
  },
  {
    id: 'water',
    icon: '🚿',
    name: 'Arrosage urgent',
    sub: 'Pompe ON immédiat',
    commands: [
      { actionneur: 'pompe', commande: true },
    ],
  },
]

const Actionneurs = () => {
  const { t, tObj } = useLanguage()
  const p = tObj.actionneursPage || {}
  
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState({})   // { [actionneur]: true }
  const [scenarioLoading, setScenarioLoading] = useState({})   // { [id]: true }
  const [error, setError] = useState('')

  /* ─── chargement initial ─── */
  const loadDevices = useCallback(async () => {
    try {
      const { data } = await api.get('/actionneurs')
      const list = (data || []).map((act, i) => {
        const info = DEVICE_MAP[act.actionneur] || { name: act.actionneur, type: 'Équipement', icon: '⚙️', color: '#6b7280', bg: '#f9fafb' }
        return {
          id: i,
          actionneur: act.actionneur,
          ...info,
          active: act.commande,
          timestamp: act.timestamp,
        }
      })
      setDevices(list)
    } catch {
      setError(p.loadError || 'Impossible de charger les actionneurs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDevices() }, [loadDevices])

  /* ─── WebSocket mise à jour temps réel ─── */
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/sensors')
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (['pompe', 'ventilateur', 'lampe'].includes(data.type_mesure)) {
          setDevices(prev => prev.map(d =>
            d.actionneur === data.type_mesure
              ? { ...d, active: data.valeur === 1.0, timestamp: data.timestamp }
              : d
          ))
        }
      } catch { /* silencieux */ }
    }
    return () => ws.close()
  }, [])

  /* ─── toggle un actionneur ─── */
  const toggle = async (device) => {
    if (toggling[device.actionneur]) return
    setToggling(p => ({ ...p, [device.actionneur]: true }))
    setError('')
    const newCmd = !device.active
    // Optimistic update
    setDevices(prev => prev.map(d =>
      d.actionneur === device.actionneur ? { ...d, active: newCmd } : d
    ))
    try {
      await api.post('/actionneurs', {
        actionneur: device.actionneur,
        commande: newCmd,
      })
    } catch {
      // Rollback
      setDevices(prev => prev.map(d =>
        d.actionneur === device.actionneur ? { ...d, active: !newCmd } : d
      ))
      setError(`${p.cmdError || 'Erreur lors de la commande de'} ${device.name}.`)
    } finally {
      setToggling(p => ({ ...p, [device.actionneur]: false }))
    }
  }

  /* ─── scénario ─── */
  const runScenario = async (scenario) => {
    if (scenarioLoading[scenario.id]) return
    setScenarioLoading(p => ({ ...p, [scenario.id]: true }))
    setError('')
    // Optimistic update
    setDevices(prev => prev.map(d => {
      const cmd = scenario.commands.find(c => c.actionneur === d.actionneur)
      return cmd ? { ...d, active: cmd.commande } : d
    }))
    try {
      await Promise.all(
        scenario.commands.map(c =>
          api.post('/actionneurs', { actionneur: c.actionneur, commande: c.commande })
        )
      )
    } catch {
      setError(`${p.scenarioError || "Erreur lors de l'exécution du scénario"} "${p.scenarios?.[scenario.id] || scenario.name}".`)
      loadDevices() // resync
    } finally {
      setScenarioLoading(p => ({ ...p, [scenario.id]: false }))
    }
  }

  /* ─── stats rapides ─── */
  const actifs = devices.filter(d => d.active).length
  const inactifs = devices.filter(d => !d.active).length

  return (
    <div className="ac-page">

      {/* ══ HERO ══ */}
      <div className="ac-hero">
        <div className="ac-hero-overlay" />
        <div className="ac-hero-body">
          <div className="ac-crumb">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3" />
            </svg>
            {p.equipmentControl || 'Contrôle des équipements'}
          </div>
          <h1 className="ac-hero-title">{t('actuators')}</h1>
          <p className="ac-hero-sub">{p.manageEquipment || 'Gérez vos équipements à distance en temps réel'}</p>

          <div className="ac-hero-pills">
            <div className="ac-pill ac-pill-green">
              <span className="ac-pill-val">{actifs}</span>
              <span className="ac-pill-label">{p.activePlural || 'Actifs'}</span>
            </div>
            <div className="ac-pill ac-pill-gray">
              <span className="ac-pill-val">{inactifs}</span>
              <span className="ac-pill-label">{p.inactivePlural || 'Inactifs'}</span>
            </div>
            <div className="ac-pill ac-pill-blue">
              <span className="ac-pill-val">{devices.length}</span>
              <span className="ac-pill-label">{t('total') || 'Total'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="ac-content">

        {/* erreur globale */}
        {error && (
          <div className="ac-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
            <button className="ac-error-close" onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* ── cartes actionneurs ── */}
        {loading ? (
          <div className="ac-loading">
            <div className="ac-spinner" />
            <span>{p.loadingActuators || 'Chargement des actionneurs...'}</span>
          </div>
        ) : devices.length === 0 ? (
          <div className="ac-empty">
            <div className="ac-empty-icon">⚙️</div>
            <p>{p.noActuators || 'Aucun actionneur disponible'}</p>
          </div>
        ) : (
          <div className="ac-grid">
            {devices.map(d => (
              <div key={d.id} className={`ac-card ${d.active ? 'on' : 'off'}`}>

                {/* header */}
                <div className="ac-card-top">
                  <div className="ac-device-icon" style={{ background: d.bg }}>
                    <span style={{ fontSize: '1.3rem' }}>{d.icon}</span>
                  </div>
                  <div className="ac-device-info">
                    <div className="ac-device-name">{d.name}</div>
                    <div className="ac-device-type">{d.type}</div>
                  </div>
                  {/* power button */}
                  <button
                    className={`ac-power ${d.active ? 'on' : 'off'} ${toggling[d.actionneur] ? 'loading' : ''}`}
                    onClick={() => toggle(d)}
                    disabled={!!toggling[d.actionneur]}
                    title={d.active ? (p.turnOff || 'Éteindre') : (p.turnOn || 'Allumer')}
                  >
                    {toggling[d.actionneur] ? (
                      <span className="ac-spin-sm" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                        <line x1="12" y1="2" x2="12" y2="12" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* status bar */}
                <div className="ac-card-status">
                  <div className="ac-status-left">
                    <span className={`ac-dot ${d.active ? 'on' : 'off'}`} />
                    <span className="ac-status-label">{d.active ? (p.running || 'En marche') : (p.stopped || 'Arrêté')}</span>
                  </div>
                  {d.timestamp && (
                    <span className="ac-timestamp">
                      {new Date(d.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {/* barre d'activité visuelle */}
                <div className="ac-activity-bar">
                  <div
                    className="ac-activity-fill"
                    style={{
                      width: d.active ? '100%' : '0%',
                      background: d.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── actions rapides ── */}
        <div className="ac-scenarios">
          <div className="ac-section-head">
            <div className="ac-section-title">{p.quickActions || '⚡ Actions rapides'}</div>
            <p className="ac-section-sub">{p.scenarioDesc || "Scénarios pré-configurés pour contrôler plusieurs équipements d'un coup"}</p>
          </div>
          <div className="ac-scenarios-grid">
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                className={`ac-scenario-btn ${scenarioLoading[s.id] ? 'loading' : ''}`}
                onClick={() => runScenario(s)}
                disabled={!!scenarioLoading[s.id]}
              >
                <div className="ac-scenario-icon">{s.icon}</div>
                <div className="ac-scenario-body">
                  <div className="ac-scenario-name">{p.scenarios?.[s.id] || s.name}</div>
                  <div className="ac-scenario-sub">{p.scenarios?.[`${s.id}_sub`] || s.sub}</div>
                </div>
                {scenarioLoading[s.id] && <span className="ac-spin-sm" style={{ marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');

        .ac-page {
          flex: 1;
          min-height: 100vh;
          background: #f4f6f3;
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ══ HERO ══ */
        .ac-hero {
          position: relative;
          height: 210px;
          background: linear-gradient(135deg, #1a3a1f 0%, #2d6a35 50%, #3a8c45 100%);
          overflow: hidden;
        }
        .ac-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            radial-gradient(ellipse 50% 60% at 80% 10%, rgba(255,255,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 5% 90%,  rgba(0,0,0,0.12) 0%, transparent 50%);
        }
        .ac-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.3) 100%);
        }
        .ac-hero-body {
          position: relative; z-index: 2;
          padding: 28px 32px 0;
        }
        .ac-crumb {
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
        .ac-hero-title {
          font-size: 2rem; font-weight: 700;
          color: white; letter-spacing: -0.5px;
          line-height: 1.15; margin-bottom: 4px;
        }
        .ac-hero-sub {
          font-size: 0.8rem; color: rgba(255,255,255,0.65);
          margin-bottom: 20px;
        }
        .ac-hero-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .ac-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 14px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.18);
        }
        .ac-pill-green { background: rgba(34,197,94,0.25); }
        .ac-pill-gray  { background: rgba(255,255,255,0.12); }
        .ac-pill-blue  { background: rgba(59,130,246,0.25); }
        .ac-pill-val {
          font-size: 1.05rem; font-weight: 700; color: white;
          font-family: 'JetBrains Mono', monospace; line-height: 1;
        }
        .ac-pill-label {
          font-size: 0.67rem; font-weight: 600;
          color: rgba(255,255,255,0.75);
          text-transform: uppercase; letter-spacing: 0.5px;
        }

        /* ══ CONTENT ══ */
        .ac-content {
          padding: 20px 28px 48px;
          display: flex; flex-direction: column; gap: 20px;
        }

        /* erreur */
        .ac-error {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 10px;
          font-size: 0.82rem; font-weight: 500; color: #991b1b;
        }
        .ac-error-close {
          margin-left: auto; background: none; border: none;
          font-size: 1.1rem; cursor: pointer; color: #991b1b; line-height: 1;
        }

        /* loading / empty */
        .ac-loading {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; padding: 60px;
          color: #aaa; font-size: 0.85rem;
        }
        .ac-spinner {
          width: 22px; height: 22px;
          border: 2px solid #e5e7eb;
          border-top-color: #1a4a26;
          border-radius: 50%;
          animation: acSpin 0.7s linear infinite;
        }
        .ac-spin-sm {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: currentColor;
          border-radius: 50%;
          animation: acSpin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes acSpin { to { transform: rotate(360deg); } }
        .ac-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; padding: 60px; color: #bbb;
        }
        .ac-empty-icon { font-size: 2.2rem; }
        .ac-empty p { font-size: 0.85rem; margin: 0; }

        /* ── grille cartes ── */
        .ac-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 14px;
          margin-top: -48px; /* overlap hero */
          position: relative; z-index: 10;
        }

        .ac-card {
          background: white;
          border-radius: 18px;
          padding: 18px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 3px 14px rgba(0,0,0,0.07);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex; flex-direction: column; gap: 12px;
        }
        .ac-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .ac-card.on {
          border-color: rgba(34,197,94,0.2);
          box-shadow: 0 3px 14px rgba(34,197,94,0.1);
        }

        .ac-card-top {
          display: flex; align-items: center; gap: 12px;
        }
        .ac-device-icon {
          width: 44px; height: 44px;
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ac-device-info { flex: 1; min-width: 0; }
        .ac-device-name {
          font-weight: 700; font-size: 0.85rem;
          color: #1a1a1a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ac-device-type { font-size: 0.68rem; color: #aaa; margin-top: 1px; }

        /* bouton power */
        .ac-power {
          width: 38px; height: 38px;
          border-radius: 12px;
          border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.18s;
          flex-shrink: 0;
        }
        .ac-power.off {
          background: #f3f4f6;
          color: #9ca3af;
        }
        .ac-power.off:hover:not(:disabled) {
          background: #1a4a26;
          color: white;
          box-shadow: 0 4px 12px rgba(26,74,38,0.3);
        }
        .ac-power.on {
          background: #1a4a26;
          color: white;
          box-shadow: 0 4px 12px rgba(26,74,38,0.3);
        }
        .ac-power.on:hover:not(:disabled) {
          background: #ef4444;
          box-shadow: 0 4px 12px rgba(239,68,68,0.3);
        }
        .ac-power:disabled { opacity: 0.6; cursor: not-allowed; }

        /* status */
        .ac-card-status {
          display: flex; align-items: center; justify-content: space-between;
        }
        .ac-status-left { display: flex; align-items: center; gap: 6px; }
        .ac-dot {
          width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
        }
        .ac-dot.on {
          background: #22c55e;
          animation: acPulse 2s infinite;
        }
        .ac-dot.off { background: #d1d5db; }
        @keyframes acPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50%      { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
        }
        .ac-status-label { font-size: 0.75rem; font-weight: 600; color: #555; }
        .ac-timestamp {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem; color: #ccc;
        }

        /* barre d'activité */
        .ac-activity-bar {
          height: 3px;
          background: #f0f0f0;
          border-radius: 2px;
          overflow: hidden;
        }
        .ac-activity-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        /* ── scénarios ── */
        .ac-scenarios {
          background: white;
          border-radius: 18px;
          padding: 20px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .ac-section-head { margin-bottom: 14px; }
        .ac-section-title {
          font-size: 0.9rem; font-weight: 700; color: #1a1a1a;
          margin-bottom: 3px;
        }
        .ac-section-sub { font-size: 0.75rem; color: #aaa; margin: 0; }

        .ac-scenarios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 10px;
        }
        .ac-scenario-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.07);
          background: #fafafa;
          cursor: pointer;
          transition: all 0.16s;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
        }
        .ac-scenario-btn:hover:not(:disabled) {
          background: #f0fdf4;
          border-color: rgba(26,74,38,0.2);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.07);
        }
        .ac-scenario-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .ac-scenario-btn.loading { pointer-events: none; }
        .ac-scenario-icon { font-size: 1.2rem; flex-shrink: 0; }
        .ac-scenario-body { flex: 1; min-width: 0; }
        .ac-scenario-name {
          font-size: 0.8rem; font-weight: 700; color: #1a1a1a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ac-scenario-sub { font-size: 0.67rem; color: #aaa; margin-top: 1px; }

        /* ── responsive ── */
        @media (max-width: 768px) {
          .ac-hero { height: 200px; }
          .ac-hero-body { padding: 20px 20px 0; }
          .ac-hero-title { font-size: 1.6rem; }
          .ac-content { padding: 14px 16px 36px; }
          .ac-grid { grid-template-columns: repeat(2, 1fr); margin-top: -36px; }
        }
        @media (max-width: 480px) {
          .ac-grid { grid-template-columns: 1fr; margin-top: -28px; }
          .ac-scenarios-grid { grid-template-columns: repeat(2, 1fr); }
          .ac-hero-pills { gap: 5px; }
        }
      `}</style>
    </div>
  )
}

export default Actionneurs