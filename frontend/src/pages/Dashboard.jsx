import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import microOrganismes from '../assets/micro-organismes-agriculture.webp';

/* ─── petit helper ─── */
const round1 = v => (typeof v === 'number' ? Math.round(v * 10) / 10 : v);

const Dashboard = () => {
  const { t } = useLanguage();
  const { user } = useUser();

  const [sensors,    setSensors]    = useState([]);
  const [actuators,  setActuators]  = useState([]);
  const [alerts,     setAlerts]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [time,       setTime]       = useState(new Date());
  const [sensorHistory, setSensorHistory] = useState({});
  const [selectedSensor, setSelectedSensor] = useState('temperature');
  const [alertPage,  setAlertPage]  = useState(1);
  const [actuatorPage, setActuatorPage] = useState(1);
  const alertsPerPage = 3;
  const actuatorsPerPage = 5;

  const wsRef = useRef(null);

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a, al, histResponse] = await Promise.all([
          api.get('/mesures/derniere'),
          api.get('/actionneurs'),
          api.get('/alertes'),
          api.get('/mesures?limit=300')
        ]);
        setSensors(s.data  || []);
        setActuators(a.data || []);
        setAlerts(al.data  || []);
        
        // Group history by sensor type
        if (histResponse.data && histResponse.data.length > 0) {
          const groupedHist = {};
          // Reverse so oldest is first
          [...histResponse.data].reverse().forEach(m => {
            if (!groupedHist[m.type_mesure]) groupedHist[m.type_mesure] = [];
            groupedHist[m.type_mesure].push({
              value: m.valeur,
              time: new Date(m.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            });
          });
          setSensorHistory(groupedHist);
        }
        
        console.log('Sensors loaded:', s.data);
        console.log('Sensor types:', s.data?.map(s => s.type_mesure));
        console.log('Actuators loaded:', a.data);
        console.log('Alerts loaded:', al.data);
      } catch (e) {
        console.error('Error loading data:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // WebSocket connection for real-time sensor updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const wsUrl = 'ws://localhost:8000/ws/sensors';
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type_mesure) {
          setSensors(prevSensors => {
            return prevSensors.map(sensor => {
              let value = sensor.valeur;
              if (sensor.type_mesure === data.type_mesure) {
                value = data.valeur;
              }
              return { ...sensor, valeur: value };
            });
          });

          // Update history for charts
          setSensorHistory(prev => {
            const sensorType = data.type_mesure;
            const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const newHistory = { ...prev };
            if (!newHistory[sensorType]) {
              newHistory[sensorType] = [];
            }
            newHistory[sensorType] = [...newHistory[sensorType].slice(-47), { value: data.valeur, time: timestamp }];
            return newHistory;
          });
        }
      } catch (e) {
        console.error('WebSocket error:', e);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  /* ─── dérivés ─── */
  const temp     = sensors.find(s => s.type_mesure === 'temperature');
  const humidity = sensors.find(s => s.type_mesure === 'humidite_air');
  const soil     = sensors.find(s => s.type_mesure === 'humidite_sol');
  const light    = sensors.find(s => s.type_mesure === 'luminosite');
  const gaz      = sensors.find(s => s.type_mesure === 'gaz');
  const water    = sensors.find(s => s.type_mesure === 'niveau_eau');
  const active   = actuators.filter(a => a.commande === true).length;
  const hour     = time.getHours();
  const greeting = hour < 12 ? (t('goodMorning') || 'Bonjour') : hour < 18 ? (t('goodAfternoon') || 'Bon après-midi') : (t('goodEvening') || 'Bonsoir');

  // Pagination logic
  const alertStartIndex = (alertPage - 1) * alertsPerPage;
  const paginatedAlerts = alerts.slice(alertStartIndex, alertStartIndex + alertsPerPage);
  const alertTotalPages = Math.ceil(alerts.length / alertsPerPage);

  const actuatorStartIndex = (actuatorPage - 1) * actuatorsPerPage;
  const paginatedActuators = actuators.slice(actuatorStartIndex, actuatorStartIndex + actuatorsPerPage);
  const actuatorTotalPages = Math.ceil(actuators.length / actuatorsPerPage);

  const sensorConfigs = {
    temperature:  { label: t('temperature') || 'Température', color: '#ff6b35', max: 50 },
    humidite_air: { label: t('humidity')    || 'Humidité Air', color: '#3b82f6', max: 100 },
    humidite_sol: { label: t('soilMoisture')|| 'Humidité Sol', color: '#22c55e', max: 100 },
    luminosite:   { label: t('light')       || 'Luminosité',   color: '#f59e0b', max: 2000 },
    gaz:          { label: t('gaz')         || 'Gaz / CO2',    color: '#8b5cf6', max: 2000 },
  };

  const activeSensorConfig = sensorConfigs[selectedSensor] || sensorConfigs.temperature;

  const sensorCards = [
    { icon: '🌡️', label: sensorConfigs.temperature.label, value: temp?.valeur,    unit: '°C',  color: '#ff6b35', bg: '#fff4f0' },
    { icon: '💧', label: sensorConfigs.humidite_air.label, value: humidity?.valeur, unit: '%',  color: '#3b82f6', bg: '#eff6ff' },
    { icon: '🌱', label: sensorConfigs.humidite_sol.label, value: soil?.valeur,    unit: '%',  color: '#22c55e', bg: '#f0fdf4' },
    { icon: '☀️', label: sensorConfigs.luminosite.label,   value: light?.valeur,   unit: 'lux', color: '#f59e0b', bg: '#fffbeb' },
    { icon: '💨', label: sensorConfigs.gaz.label,          value: gaz?.valeur,     unit: 'ppm', color: '#8b5cf6', bg: '#f5f3ff' },
    { icon: '🚰', label: 'Niveau d\'eau',                  value: water?.valeur,    unit: '',   color: '#06b6d4', bg: '#ecfeff', kind: 'water' },
  ];

  const tabs = [
    t('overview') || 'Vue générale',
    t('sensors')  || 'Capteurs',
    t('actuators')|| 'Actionneurs',
    t('alerts')   || 'Alertes',
  ];
  const [activeTab, setActiveTab] = useState(0);

  if (loading) return (
    <div className="db-loading">
      <div className="db-spinner" />
    </div>
  );

  return (
    <div className="db">

      {/* ══ HERO BANNER ══ */}
      <div className="db-hero ">
        
        <div className="db-hero-overlay" />
        <div className="db-hero-body">

          {/* title */}
          <h1 className="db-hero-title">{greeting}{user?.nom ? `, ${user.nom.split(' ')[0]}` : ''} 👋</h1>
          <p className="db-hero-sub">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            &nbsp;·&nbsp;
            {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>

          {/* tabs */}
          <div className="db-tabs">
            {tabs.map((tab, i) => (
              <button
                key={i}
                className={`db-tab ${activeTab === i ? 'on' : ''}`}
                onClick={() => setActiveTab(i)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* top-right photo strip */}
          <div className="db-photo-strip">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="db-photo-thumb" style={{ background: `hsl(${140 + i * 20},40%,${50 - i * 8}%)` }} />
            ))}
            <div className="db-photo-more">+5</div>
          </div>

          {/* action buttons */}
          <div className="db-hero-actions">


          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="db-content">

        {/* ── ROW 1 : sensor cards ── */}
        <div className="db-sensor-row">
          {sensorCards.map((c, i) => (
            <div className="db-sensor-card" key={i} style={{ '--card-color': c.color, '--card-bg': c.bg }}>
              <div className="db-sensor-icon">{c.icon}</div>
              {c.kind === 'water' ? (
                <div className="db-sensor-val">
                  {c.value != null ? (
                    <span className={`water-level ${c.value >= 1 || c.value === true ? 'high' : 'low'}`}>
                      {c.value >= 1 || c.value === true ? 'HAUT' : 'BAS'}
                    </span>
                  ) : '—'}
                </div>
              ) : (
                <div className="db-sensor-val">
                  {c.value != null ? round1(c.value) : '—'}
                  <span className="db-sensor-unit">{c.unit}</span>
                </div>
              )}
              <div className="db-sensor-label">{c.label}</div>
              {c.kind !== 'water' && (
                <div className="db-sensor-bar">
                  <div className="db-sensor-fill" style={{ width: `${Math.min(100, (c.value || 0))}%` }} />
                </div>
              )}
              {c.kind === 'water' && (
                <div className="water-indicator">
                  <div className={`water-dot ${c.value >= 1 || c.value === true ? 'high' : 'low'}`} />
                  <span className="water-status">
                    {c.value >= 1 || c.value === true ? 'Niveau OK' : 'Niveau bas'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── ROW 2 : big cards ── */}
        <div className="db-row2">

          {/* Actionneurs */}
          <div className="db-card db-card-act">
            <div className="db-card-head">
              <div className="db-card-icon-wrap" style={{ background: '#f0fdf4' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3"/>
                </svg>
              </div>
              <div>
                <div className="db-card-title">{t('actuators') || 'Actionneurs'}</div>
                <div className="db-card-sub">{active} / {actuators.length} {t('active') || 'actifs'}</div>
              </div>
            </div>
            <div className="db-act-bars">
              {paginatedActuators.map((a, i) => (
                <div className="db-act-row" key={i}>
                  <span className="db-act-name">{a.actionneur}</span>
                  <div className="db-act-track">
                    <div className="db-act-fill" style={{ width: a.commande ? '100%' : '0%', background: a.commande ? '#22c55e' : '#e5e7eb' }} />
                  </div>
                  <span className={`db-act-state ${a.commande ? 'on' : 'off'}`}>{a.commande ? 'ON' : 'OFF'}</span>
                </div>
              ))}
            </div>
            {actuatorTotalPages > 1 && (
              <div className="db-pagination">
                <button 
                  className="db-page-btn"
                  onClick={() => setActuatorPage(p => Math.max(1, p - 1))}
                  disabled={actuatorPage === 1}
                >
                  ‹
                </button>
                <span className="db-page-info">{actuatorPage} / {actuatorTotalPages}</span>
                <button 
                  className="db-page-btn"
                  onClick={() => setActuatorPage(p => Math.min(actuatorTotalPages, p + 1))}
                  disabled={actuatorPage === actuatorTotalPages}
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {/* Activity with line chart */}
          <div className="db-card db-card-busy">
            <div className="db-card-head" style={{ marginBottom: '8px' }}>
              <div className="db-card-icon-wrap" style={{ background: `${activeSensorConfig.color}20` }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={activeSensorConfig.color} strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div className="db-card-title">{t('activity') || 'Activité'}</div>
                <div className="db-card-sub">{t('realTime') || 'Dernières 24h'}</div>
              </div>
            </div>
            
            <div className="db-chart-selectors" style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
              {Object.entries(sensorConfigs).map(([key, conf]) => (
                <button 
                  key={key} 
                  className={`db-chart-sel-btn ${selectedSensor === key ? 'active' : ''}`}
                  onClick={() => setSelectedSensor(key)}
                  style={{
                    backgroundColor: selectedSensor === key ? conf.color : 'transparent',
                    borderColor: selectedSensor === key ? conf.color : '#e5e7eb',
                    color: selectedSensor === key ? 'white' : '#6b7280'
                  }}
                >
                  {conf.label}
                </button>
              ))}
            </div>

            <div className="db-line-chart" style={{ height: '140px' }}>
              <svg viewBox="0 0 200 80" className="db-chart-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={activeSensorConfig.color} stopOpacity="0.3"/>
                    <stop offset="100%" stopColor={activeSensorConfig.color} stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {sensorHistory[selectedSensor] && sensorHistory[selectedSensor].length > 1 && (
                  <>
                    <path
                      d={`M0,${80 - Math.min(80, (sensorHistory[selectedSensor][0]?.value / activeSensorConfig.max) * 70)} ${sensorHistory[selectedSensor].map((d, i) => 
                        `L${(i / (sensorHistory[selectedSensor].length - 1)) * 200},${80 - Math.min(80, (d.value / activeSensorConfig.max) * 70)}`
                      ).join(' ')} L200,80 L0,80 Z`}
                      fill="url(#lineGradient)"
                      stroke="none"
                    />
                    <path
                      d={`M0,${80 - Math.min(80, (sensorHistory[selectedSensor][0]?.value / activeSensorConfig.max) * 70)} ${sensorHistory[selectedSensor].map((d, i) => 
                        `L${(i / (sensorHistory[selectedSensor].length - 1)) * 200},${80 - Math.min(80, (d.value / activeSensorConfig.max) * 70)}`
                      ).join(' ')}`}
                      fill="none"
                      stroke={activeSensorConfig.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}
              </svg>
            </div>
            <div className="db-chart-legend" style={{ marginTop: '12px' }}>
              <span className="db-legend-item">
                <span className="db-legend-dot" style={{ background: activeSensorConfig.color }}></span>
                {activeSensorConfig.label} (24h)
              </span>
            </div>
          </div>

          {/* Alertes */}
          <div className="db-card db-card-alerts">
            <div className="db-card-head">
              <div className="db-card-icon-wrap" style={{ background: '#fff7ed' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <div>
                <div className="db-card-title">{t('alerts') || 'Alertes'}</div>
                <div className="db-card-sub">{alerts.length} {t('recent') || 'récentes'}</div>
              </div>
            </div>
            <div className="db-alerts-list">
              {alerts.length === 0 && (
                <div className="db-alerts-empty">
                  <span>✅</span> {t('noAlerts') || 'Aucune alerte'}
                </div>
              )}
              {paginatedAlerts.map((al, i) => (
                <div className="db-alert-item" key={i}>
                  <div className={`db-alert-dot ${al.type_mesure === 'temperature' || al.type_mesure === 'co2' ? 'high' : 'medium'}`} />
                  <div className="db-alert-text">
                    <div className="db-alert-msg">{al.message}</div>
                    <div className="db-alert-time">{al.timestamp ? new Date(al.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                  </div>
                </div>
              ))}
            </div>
            {alertTotalPages > 1 && (
              <div className="db-pagination">
                <button 
                  className="db-page-btn"
                  onClick={() => setAlertPage(p => Math.max(1, p - 1))}
                  disabled={alertPage === 1}
                >
                  ‹
                </button>
                <span className="db-page-info">{alertPage} / {alertTotalPages}</span>
                <button 
                  className="db-page-btn"
                  onClick={() => setAlertPage(p => Math.min(alertTotalPages, p + 1))}
                  disabled={alertPage === alertTotalPages}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .db {
          flex: 1;
          min-height: 100vh;
          background: #f4f6f3;
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ══ LOADING ══ */
        .db-loading {
          display: flex; align-items: center; justify-content: center;
          min-height: 60vh;
        }
        .db-spinner {
          width: 28px; height: 28px;
          border: 2px solid #e5e7eb;
          border-top-color: #1a4a26;
          border-radius: 50%;
          animation: dbSpin 0.7s linear infinite;
        }
        @keyframes dbSpin { to { transform: rotate(360deg); } }

        /* ══ HERO ══ */
        .db-hero {
          position: relative;
          height: 280px;
          background: linear-gradient(135deg, rgba(26, 58, 31, 0.9) 0%, rgba(45, 106, 53, 0.85) 40%, rgba(58, 140, 69, 0.8) 70%, rgba(74, 170, 85, 0.75) 100%),
                      url(${microOrganismes}) center/cover no-repeat;
          overflow: hidden;
        }

        /* motif de fond organique */
        .db-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(255,255,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 10% 80%, rgba(0,0,0,0.15) 0%, transparent 50%);
        }

        .db-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.35) 100%);
        }

        .db-hero-body {
          position: relative; z-index: 2;
          padding: 28px 32px 0;
          height: 100%;
        }

        .db-crumb {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 0.72rem;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          margin-bottom: 14px;
        }

        .db-hero-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: white;
          letter-spacing: -0.5px;
          line-height: 1.15;
          margin-bottom: 6px;
        }

        .db-hero-sub {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.7);
          margin-bottom: 22px;
        }

        .db-tabs {
          display: flex;
          gap: 4px;
        }

        .db-tab {
          padding: 7px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          font-size: 0.78rem;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .db-tab.on {
          background: rgba(255,255,255,0.22);
          color: white;
          border-color: rgba(255,255,255,0.35);
        }
        .db-tab:hover:not(.on) { background: rgba(255,255,255,0.15); color: white; }

        .db-photo-strip {
          position: absolute;
          top: 24px; right: 28px;
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .db-photo-thumb {
          width: 36px; height: 36px;
          border-radius: 8px;
          border: 1.5px solid rgba(255,255,255,0.5);
          flex-shrink: 0;
        }
        .db-photo-more {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: rgba(255,255,255,0.18);
          border: 1.5px solid rgba(255,255,255,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          color: white;
        }

        .db-hero-actions {
          position: absolute;
          bottom: 24px; right: 28px;
          display: flex;
          gap: 6px;
        }
        .db-action-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 13px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          font-size: 0.72rem;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .db-action-btn:hover { background: rgba(255,255,255,0.22); color: white; }

        /* ══ CONTENT ══ */
        .db-content {
          padding: 20px 24px 40px;

  /* ── sensor row ── */
  .db-sensor-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
    margin-top: -52px; /* overlap hero */
    position: relative;
    z-index: 10;
  }

        .db-sensor-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.07);
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .db-sensor-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.1);
        }

        .db-sensor-icon {
          font-size: 1.3rem;
          margin-bottom: 10px;
          display: block;
        }
        .db-sensor-val {
          font-size: 1.7rem;
          font-weight: 700;
          color: var(--card-color);
          line-height: 1;
          margin-bottom: 4px;
        }
        .db-sensor-unit {
          font-size: 0.75rem;
          font-weight: 500;
          color: #aaa;
          margin-left: 2px;
        }
        .db-sensor-label {
          font-size: 0.72rem;
          font-weight: 500;
          color: #888;
          margin-bottom: 10px;
        }
        .db-sensor-bar {
          height: 3px;
          background: #f0f0f0;
          border-radius: 2px;
          overflow: hidden;
        }
        .db-sensor-fill {
          height: 100%;
          background: var(--card-color);
          border-radius: 2px;
          transition: width 0.6s ease;
          max-width: 100%;
        }

        /* ── row 2 ── */
        .db-row2 {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 16px;
        }

        .db-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }

        .db-card-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .db-card-icon-wrap {
          width: 32px; height: 32px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .db-card-title { font-size: 0.82rem; font-weight: 700; color: #1a1a1a; }
        .db-card-sub   { font-size: 0.68rem; color: #aaa; margin-top: 1px; }

        /* actionneurs */
        .db-act-bars { display: flex; flex-direction: column; gap: 8px; }
        .db-act-row { display: flex; align-items: center; gap: 8px; }
        .db-act-name { font-size: 0.72rem; color: #555; width: 80px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .db-act-track { flex: 1; height: 4px; background: #f0f0f0; border-radius: 2px; overflow: hidden; }
        .db-act-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
        .db-act-state { font-size: 0.58rem; font-weight: 700; width: 24px; text-align: right; }
        .db-act-state.on { color: #22c55e; }
        .db-act-state.off { color: #d1d5db; }

        /* bar chart */
        .db-busy-chart {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          height: 80px;
        }
        .db-busy-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          height: 100%;
          justify-content: flex-end;
        }
        .db-busy-bar {
          width: 100%;
          border-radius: 4px 4px 0 0;
          transition: height 0.4s ease;
          min-height: 4px;
        }
        .db-busy-day { font-size: 0.58rem; color: #bbb; font-weight: 600; }

        /* line chart */
        .db-line-chart {
          position: relative;
          width: 100%;
        }
        .db-chart-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        .db-chart-sel-btn {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: 0.2s;
          background: transparent;
        }
        .db-chart-sel-btn:hover:not(.active) {
          background: #f3f4f6 !important;
        }
        .db-chart-legend {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        .db-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          color: #888;
          font-weight: 500;
        }
        .db-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* alertes */
        .db-alerts-list { display: flex; flex-direction: column; gap: 8px; }
        .db-alerts-empty { font-size: 0.78rem; color: #aaa; text-align: center; padding: 12px 0; }
        .db-alert-item { display: flex; align-items: flex-start; gap: 8px; }
        .db-alert-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          margin-top: 4px;
          flex-shrink: 0;
        }
        .db-alert-dot.critical, .db-alert-dot.high   { background: #ef4444; }
        .db-alert-dot.warning,  .db-alert-dot.medium { background: #f59e0b; }
        .db-alert-dot.info,     .db-alert-dot.low    { background: #3b82f6; }
        .db-alert-msg  { font-size: 0.75rem; color: #333; font-weight: 500; }
        .db-alert-time { font-size: 0.65rem; color: #bbb; margin-top: 1px; }

        /* pagination */
        .db-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #f0f0f0;
        }
        .db-page-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #666;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .db-page-btn:hover:not(:disabled) {
          background: #f5f5f5;
          color: #333;
          border-color: #d1d5db;
        }
        .db-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .db-page-info {
          font-size: 0.7rem;
          color: #888;
          font-weight: 500;
        }

        /* ── row 3 ── */
        .db-row3 {
          display: grid;
          grid-template-columns: 1fr 240px;
          gap: 12px;
        }

        /* map */
        .db-map-placeholder {
          height: 160px;
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }
        .db-map-placeholder::before {
          content: '';
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 20px),
                            repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 20px);
        }
        .db-map-pin {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .db-pin-dot {
          width: 14px; height: 14px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          animation: dbPulse 2s infinite;
        }
        @keyframes dbPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4), 0 2px 6px rgba(0,0,0,0.2); }
          50%      { box-shadow: 0 0 0 8px rgba(34,197,94,0), 0 2px 6px rgba(0,0,0,0.2); }
        }
        .db-pin-label {
          background: white;
          border-radius: 4px;
          padding: 1px 6px;
          font-size: 0.6rem;
          font-weight: 700;
          color: #333;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .db-map-controls {
          position: absolute;
          bottom: 10px; right: 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .db-map-btn {
          width: 24px; height: 24px;
          background: white;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        /* mini stats */
        .db-mini-stats {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .db-mini-card {
          background: white;
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        .db-mini-icon { font-size: 1.1rem; }
        .db-mini-body { flex: 1; }
        .db-mini-label { font-size: 0.65rem; color: #aaa; font-weight: 500; }
        .db-mini-val   { font-size: 1rem; font-weight: 700; line-height: 1.2; }
        .db-mini-unit  { font-size: 0.65rem; font-weight: 500; color: #bbb; margin-left: 2px; }

        /* water level indicator */
        .water-level {
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .water-level.high { color: #22c55e; }
        .water-level.low  { color: #ef4444; }
        .water-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }
        .water-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .water-dot.high { background: #22c55e; }
        .water-dot.low  { background: #ef4444; }
        .water-status {
          font-size: 0.7rem;
          color: #888;
          font-weight: 500;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) {
          .db-row2 { grid-template-columns: 1fr 1fr; }
          .db-card-alerts { grid-column: 1 / -1; }
          .db-row3 { grid-template-columns: 1fr; }
          .db-mini-stats { flex-direction: row; flex-wrap: wrap; }
          .db-mini-card { flex: 1; min-width: 120px; }
        }
        @media (max-width: 768px) {
          .db-hero { height: 220px; }
          .db-hero-title { font-size: 1.6rem; }
          .db-sensor-row { grid-template-columns: repeat(2, 1fr); margin-top: -40px; }
          .db-row2 { grid-template-columns: 1fr; }
          .db-photo-strip { display: none; }
          .db-content { padding: 12px 14px 32px; }
        }
        @media (max-width: 480px) {
          .db-hero { height: 200px; }
          .db-hero-body { padding: 20px 16px 0; }
          .db-hero-title { font-size: 1.35rem; }
          .db-sensor-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .db-tabs { flex-wrap: wrap; gap: 4px; }
          .db-hero-actions { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;