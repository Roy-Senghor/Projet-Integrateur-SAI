import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [sensors, setSensors] = useState([
    { name: 'Température air', unit: '°C', value: 24.5, status: 'ok', bg: '#fef9e8', icon: '🌡️' },
    { name: 'Humidité sol', unit: '%', value: 45, status: 'ok', bg: '#e6f7ec', icon: '💧' },
    { name: 'Luminosité', unit: 'lux', value: 720, status: 'ok', bg: '#fef7e0', icon: '☀️' },
    { name: 'Humidité air', unit: '%', value: 62, status: 'ok', bg: '#e0f2fe', icon: '💨' },
    { name: 'CO₂', unit: 'ppm', value: 1520, status: 'warning', bg: '#ffe4e2', icon: '🫧' },
    { name: 'Réserve eau', unit: '%', value: 68, status: 'ok', bg: '#e6f7ec', icon: '💦' },
  ]);
  const [alerts] = useState([
    { msg: 'CO₂ > 1500 ppm : ventilation automatique activée', time: '14:32', level: 'critique' },
    { msg: 'Humidité sol < 45% : irrigation programmée', time: '13:15', level: 'warning' },
    { msg: 'Module LED allumé selon cycle lunaire', time: '11:40', level: 'info' },
  ]);
  const [activeChart, setActiveChart] = useState('temperature');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bannerVisible, setBannerVisible] = useState(true);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Génération de données historiques simulées
  const generateHistory = (base, noise, len = 25) => {
    return Array.from({ length: len }, (_, i) =>
      +(base + (Math.random() - 0.5) * noise + Math.sin(i / 3.5) * noise * 0.4).toFixed(1)
    );
  };
  const [chartData, setChartData] = useState({
    temperature: { data: generateHistory(23.5, 3.5), color: '#f97316' },
    humidite: { data: generateHistory(52, 14), color: '#3b82f6' },
    luminosite: { data: generateHistory(680, 310), color: '#f59e0b' },
    co2: { data: generateHistory(1380, 280), color: '#ef4444' },
  });
  const labels = Array.from({ length: 25 }, (_, i) => `${i}h`);

  // Initialisation du graphique
  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();
      const ctx = chartRef.current.getContext('2d');
      const selected = chartData[activeChart];
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data: selected.data,
            borderColor: selected.color,
            backgroundColor: selected.color + '18',
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 5,
            fill: true,
            tension: 0.3,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', titleColor: '#e2e8f0', bodyColor: '#f1f5f9', cornerRadius: 12 } },
          scales: { x: { grid: { color: '#e9edec' }, ticks: { font: { size: 10 } } }, y: { grid: { color: '#e9edec' } } },
        },
      });
    }
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [activeChart, chartData]);

  // Simulation temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev =>
        prev.map(s => {
          let newVal = s.value + (Math.random() - 0.5) * 2.2;
          if (s.name === 'CO₂') newVal = Math.min(1850, Math.max(950, newVal));
          else if (s.name === 'Humidité sol') newVal = Math.min(85, Math.max(28, newVal));
          else if (s.name === 'Température air') newVal = Math.min(38, Math.max(12, newVal));
          else newVal = Math.max(0, newVal);
          newVal = parseFloat(newVal.toFixed(1));
          const newStatus = s.name === 'CO₂' && newVal > 1500 ? 'warning' : 'ok';
          return { ...s, value: newVal, status: newStatus };
        })
      );
      setCurrentTime(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleActuator = (id, isOn) => {
    const metaElem = document.getElementById(id);
    if (metaElem) metaElem.textContent = `Manuel · ${isOn ? 'ON 🔛' : 'OFF ⚫'}`;
  };

  const dismissBanner = () => setBannerVisible(false);

  const co2Sensor = sensors.find(s => s.name === 'CO₂');
  const showBanner = bannerVisible && co2Sensor && co2Sensor.value > 1500;

  return (
    <main className="main">
      <div className="topbar">
        <h1>Tableau de bord</h1>
        <div className="topbar-time">
          <span className="live-dot"></span>
          <span>{currentTime.toLocaleTimeString('fr-FR')}</span>
        </div>
      </div>
      <div className="content">
        {showBanner && (
          <div className="alert-banner">
            <div className="alert-banner-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <div className="alert-banner-text">
              <p>⚠️ CO₂ excessif : {co2Sensor.value} ppm</p>
              <span>Seuil dépassé (max 1500 ppm) → activez la ventilation.</span>
            </div>
            <span className="alert-dismiss" onClick={dismissBanner}>×</span>
          </div>
        )}

        <div className="section-header">
          <div className="section-title">Capteurs en temps réel</div>
        </div>

        <div className="sensors-grid">
          {sensors.map((s, idx) => (
            <div key={idx} className={`sensor-card ${s.status === 'warning' ? 'warning' : ''}`}>
              <div className="sensor-card-top">
                <div className="sensor-icon-wrap" style={{ background: s.bg }}><span style={{ fontSize: 24 }}>{s.icon}</span></div>
                <span className={`sensor-status-badge ${s.status === 'ok' ? 'badge-ok' : 'badge-warning'}`}>
                  {s.status === 'ok' ? '✅ Normal' : '⚠️ Alerte'}
                </span>
              </div>
              <div className="sensor-name">{s.name}</div>
              <div className="sensor-value">{s.value}<span className="sensor-unit">{s.unit}</span></div>
            </div>
          ))}
        </div>

        <div className="bottom-grid">
          <div className="chart-card">
            <div className="chart-header">
              <div className="section-title">📈 Tendances 24h</div>
              <div className="chart-tabs">
                {['temperature', 'humidite', 'luminosite', 'co2'].map(type => (
                  <button
                    key={type}
                    className={`chart-tab ${activeChart === type ? 'active' : ''}`}
                    onClick={() => setActiveChart(type)}
                  >
                    {type === 'temperature' && '🌡️ Temp.'}
                    {type === 'humidite' && '💧 Humidité sol'}
                    {type === 'luminosite' && '☀️ Luminosité'}
                    {type === 'co2' && '🫧 CO₂'}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-wrap"><canvas ref={chartRef}></canvas></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="panel-card">
              <div className="panel-title">⚙️ Actionneurs intelligents</div>
              <div className="actuator-item">
                <div className="actuator-icon" style={{ background: '#e6f7ec' }}>💧</div>
                <div style={{ flex: 1 }}><div className="actuator-name">Pompe d'irrigation</div><div className="actuator-meta" id="pompe-meta">Manuel · OFF</div></div>
                <label className="toggle"><input type="checkbox" onChange={(e) => toggleActuator('pompe-meta', e.target.checked)} /><span className="toggle-slider"></span></label>
              </div>
              <div className="actuator-item">
                <div className="actuator-icon" style={{ background: '#eef2ff' }}>🌀</div>
                <div style={{ flex: 1 }}><div className="actuator-name">Ventilation forcée</div><div className="actuator-meta" id="ventil-meta">Auto · ON</div></div>
                <label className="toggle"><input type="checkbox" defaultChecked onChange={(e) => toggleActuator('ventil-meta', e.target.checked)} /><span className="toggle-slider"></span></label>
              </div>
              <div className="actuator-item">
                <div className="actuator-icon" style={{ background: '#fff3e0' }}>💡</div>
                <div style={{ flex: 1 }}><div className="actuator-name">Éclairage LED</div><div className="actuator-meta" id="led-meta">Programmé · OFF</div></div>
                <label className="toggle"><input type="checkbox" onChange={(e) => toggleActuator('led-meta', e.target.checked)} /><span className="toggle-slider"></span></label>
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-title">🔔 Alertes récentes</div>
              {alerts.map((a, idx) => (
                <div key={idx} className="alert-item">
                  <div className={`alert-dot ${a.level}`}></div>
                  <div style={{ flex: 1 }}><div className="alert-item-msg">{a.msg}</div><div className="alert-item-time">{a.time}</div></div>
                  <span className={`alert-level ${a.level}`}>{a.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;