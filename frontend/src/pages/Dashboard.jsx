import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import {
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Gauge,
  Activity,
  Cpu,
  Zap,
  Bell,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Fan,
  Waves
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
  const { lang, t } = useLanguage();

  const [sensors, setSensors] = useState([
    { id: 1, nameKey: 'tempAir', unit: '°C', value: 24.5, threshold: { min: 15, max: 32 }, status: 'ok', icon: '', lucide: Thermometer, color: '#ff6b6b', bg: '#fff0f0' },
    { id: 2, nameKey: 'humSoil', unit: '%', value: 45, threshold: { min: 40, max: 70 }, status: 'ok', icon: '', lucide: Droplets, color: '#4dabf7', bg: '#e7f5ff' },
    { id: 3, nameKey: 'lux', unit: 'lux', value: 720, threshold: { min: 500, max: 1200 }, status: 'ok', icon: '', lucide: Sun, color: '#fcc419', bg: '#fff9db' },
    { id: 4, nameKey: 'humAir', unit: '%', value: 62, threshold: { min: 40, max: 80 }, status: 'ok', icon: '', lucide: Wind, color: '#63e6be', bg: '#e6fcf5' },
    { id: 5, nameKey: 'co2', unit: 'ppm', value: 1520, threshold: { min: 400, max: 1500 }, status: 'warning', icon: '', lucide: Gauge, color: '#ff922b', bg: '#fff4e6' },
    { id: 6, nameKey: 'waterRes', unit: '%', value: 68, threshold: { min: 20, max: 100 }, status: 'ok', icon: '', lucide: Activity, color: '#2b8a3e', bg: '#ebfbee' },
  ]);

  const [activeChart, setActiveChart] = useState('temperature');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bannerVisible, setBannerVisible] = useState(true);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const generateHistory = (base, noise, len = 24) =>
    Array.from({ length: len }, (_, i) =>
      +(base + (Math.random() - 0.5) * noise + Math.sin(i / 4) * (noise * 0.6)).toFixed(1)
    );

  const [chartData] = useState({
    temperature: { data: generateHistory(24, 4), color: '#ff6b6b', labelKey: 'tempAir', unit: '°C', icon: Thermometer },
    humidite: { data: generateHistory(48, 13), color: '#4dabf7', labelKey: 'humSoil', unit: '%', icon: Droplets },
    luminosite: { data: generateHistory(720, 280), color: '#fcc419', labelKey: 'lux', unit: 'lux', icon: Sun },
    co2: { data: generateHistory(1420, 210), color: '#ff922b', labelKey: 'co2', unit: 'ppm', icon: Gauge },
  });

  const labels = Array.from({ length: 24 }, (_, i) => `${i}h`);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const selected = chartData[activeChart];
    const ctx = chartRef.current.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, selected.color + '66');
    gradient.addColorStop(1, selected.color + '00');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${t(selected.labelKey)} (${selected.unit})`,
          data: selected.data,
          borderColor: selected.color,
          backgroundColor: gradient,
          borderWidth: 4,
          tension: 0.45,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: selected.color,
          pointHoverBorderWidth: 3,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1a2c1e',
            bodyColor: '#5c6f5e',
            borderColor: selected.color + '33',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            usePointStyle: true,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 }
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
          y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [activeChart, lang]); // Re-render on language change too

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev =>
        prev.map(sensor => {
          let delta = (Math.random() - 0.5) * (sensor.nameKey === 'co2' ? 45 : 2.8);
          let newVal = sensor.value + delta;
          if (sensor.nameKey === 'co2') newVal = Math.max(950, Math.min(1850, newVal));
          else if (sensor.nameKey === 'humSoil') newVal = Math.max(28, Math.min(82, newVal));
          else if (sensor.nameKey === 'tempAir') newVal = Math.max(14, Math.min(36, newVal));
          else newVal = Math.max(0, Math.min(999, newVal));

          newVal = parseFloat(newVal.toFixed(1));
          const isWarning =
            (sensor.nameKey === 'co2' && newVal > sensor.threshold.max) ||
            (sensor.nameKey === 'humSoil' && newVal < sensor.threshold.min);

          return { ...sensor, value: newVal, status: isWarning ? 'warning' : 'ok' };
        })
      );
      setCurrentTime(new Date());
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const toggleActuator = (id, isOn) => {
    const meta = document.getElementById(id);
    if (meta) meta.textContent = isOn ? `${t('active')} 🔛` : `${t('standby')} ⚫`;
  };

  const dismissBanner = () => setBannerVisible(false);
  const co2Sensor = sensors.find(s => s.nameKey === 'co2');

  const alerts = [
    { msgKey: 'co2Excess', val: co2Sensor?.value + ' ppm', subKey: 'ventAuto', time: '14:32', levelKey: 'critique' },
    { msgKey: 'humSoil', subKey: 'irrigationSched', time: '13:15', levelKey: 'warning' },
    { msgKey: 'ledCycle', time: '11:40', levelKey: 'info' },
  ];

  return (
    <main className="main">
      <div className="topbar">
        <h1>{t('dashboard')}</h1>
        <div className="topbar-time">

          <span>{currentTime.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US')}</span>
        </div>
      </div>

      <div className="content">
        {bannerVisible && co2Sensor && co2Sensor.value > 1500 && (
          <div className="alert-banner">
            <div className="alert-banner-icon">
              <AlertTriangle size={24} color="#f59e0b" />
            </div>
            <div className="alert-banner-text">
              <p>{t('co2Excess')} : {co2Sensor.value} ppm</p>
              <span>{t('ventAuto')}</span>
            </div>
            <span className="alert-dismiss" onClick={dismissBanner}>×</span>
          </div>
        )}

        <div className="section-header">
          <div className="section-title"><Cpu size={20} color="#2b7e3b" /> {t('sensorsState')}</div>
        </div>

        <div className="sensors-grid">
          {sensors.map((sensor) => (
            <div key={sensor.id} className={`sensor-card ${sensor.status === 'warning' ? 'warning' : ''}`}>
              <div className="sensor-card-top">
                <div className="sensor-icon-wrap" style={{ background: sensor.bg, color: sensor.color }}>
                  <sensor.lucide size={28} />
                </div>
                <span className={`sensor-status-badge ${sensor.status === 'warning' ? 'badge-warning' : ''}`}>
                  {sensor.status === 'ok' ? <><CheckCircle size={12} style={{ marginRight: 4 }} /> {t('optimal')}</> : <><AlertTriangle size={12} style={{ marginRight: 4 }} /> {t('alert')}</>}
                </span>
              </div>
              <div className="sensor-name">{sensor.icon} {t(sensor.nameKey)}</div>
              <div className="sensor-value" style={{ color: sensor.status === 'warning' ? '#c2410c' : 'inherit' }}>
                {sensor.value}
                <span className="sensor-unit">{sensor.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bottom-grid">
          <div className="chart-card">
            <div className="chart-header">
              <div className="section-title"><Activity size={20} color="#2b7e3b" /> {t('trends24h')}</div>
              <div className="chart-tabs">
                {['temperature', 'humidite', 'luminosite', 'co2',].map((type) => {
                  const Icon = chartData[type].icon;
                  const labelKey = chartData[type].labelKey;
                  return (
                    <button
                      key={type}
                      className={`chart-tab ${activeChart === type ? 'active' : ''}`}
                      onClick={() => setActiveChart(type)}
                    >
                      <Icon size={16} />
                      {t(labelKey).split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="chart-wrap">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-title"><Zap size={20} color="#2b7e3b" /> {t('activeControl')}</div>

            {[
              { nameKey: "pump", icon: "💧", lucide: Waves, id: "pompe", defaultOn: false, color: '#4dabf7' },
              { nameKey: "ventilation", icon: "🌀", lucide: Fan, id: "ventil", defaultOn: true, color: '#63e6be' },
              { nameKey: "led", icon: "💡", lucide: Lightbulb, id: "led", defaultOn: false, color: '#fcc419' },
            ].map((actuator) => (
              <div key={actuator.id} className="actuator-item">
                <div className="actuator-icon" style={{ color: actuator.color }}>
                  <actuator.lucide size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="actuator-name">{actuator.icon} {t(actuator.nameKey)}</div>
                  <div className="actuator-meta" id={`${actuator.id}-meta`}>
                    {actuator.defaultOn ? `${t('auto')} · ${t('active')}` : `${t('manual')} · ${t('standby')}`}
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    defaultChecked={actuator.defaultOn}
                    onChange={(e) => toggleActuator(`${actuator.id}-meta`, e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            ))}

            <div style={{ marginTop: 'auto', paddingTop: 20 }}>
              <div className="last-update-tag">
                {t('updatedAt')} : {currentTime.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US')}
              </div>
            </div>
          </div>
        </div>

        <div className="alerts-section">
          <div className="section-header">
            <div className="section-title"><Bell size={20} color="#2b7e3b" /> {t('activityLog')}</div>
          </div>
          <div className="alerts-grid">
            {alerts.map((alert, idx) => (
              <div key={idx} className="alert-item-card">
                <div className={`alert-indicator ${alert.levelKey === 'critique' ? 'critique' : alert.levelKey === 'warning' ? 'warning' : 'info'}`}></div>
                <div className="alert-content">
                  <div className="alert-header">
                    <span className={`alert-badge ${alert.levelKey === 'critique' ? 'critique' : alert.levelKey === 'warning' ? 'warning' : 'info'}`}>{t(alert.levelKey)}</span>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                  <div className="alert-message">
                    {t(alert.msgKey)} {alert.val ? `: ${alert.val}` : ''}
                    {alert.subKey && <div style={{ fontSize: '0.75rem', marginTop: 4, opacity: 0.8 }}>{t(alert.subKey)}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;