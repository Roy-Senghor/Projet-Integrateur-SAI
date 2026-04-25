import React, { useState } from 'react';
import '../styles/dashboard.css';
import '../styles/seuils.css';

const Seuils = () => {
  const [thresholds, setThresholds] = useState([
    { id: 'temp', name: 'Température', unit: '°C', min: 18, max: 30, active: true, color: '#f97316' },
    { id: 'hum_air', name: 'Humidité de l\'air', unit: '%', min: 30, max: 70, active: true, color: '#3b82f6' },
    { id: 'hum_sol', name: 'Humidité du sol', unit: '%', min: 35, max: 80, active: true, color: '#0ea5e9' },
    { id: 'lum', name: 'Luminosité', unit: 'lux', min: 300, max: 1000, active: true, color: '#f59e0b' },
  ]);

  const [rules, setRules] = useState([
    { id: 1, condition: 'Humidité du sol < 30%', action: 'Activer irrigation', active: true },
    { id: 2, condition: 'Température > 28°C', action: 'Activer ventilation', active: true },
    { id: 3, condition: 'Luminosité < 400 lux', action: 'Activer lampes de croissance', active: false },
  ]);

  const toggleThreshold = (id) => {
    setThresholds(thresholds.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const toggleRule = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <main className="main">
      <div className="topbar">
        <div className="header-text">
          <h1>Seuils</h1>
          <p className="subtitle">Définissez les limites pour vos capteurs</p>
        </div>
      </div>

      <div className="content">
        <div className="thresholds-grid">
          {thresholds.map((t) => (
            <div key={t.id} className="threshold-card" style={{ borderLeft: `4px solid ${t.color}` }}>
              <div className="threshold-card-header">
                <div className="threshold-info">
                  <div className="threshold-icon" style={{ background: t.color + '15', color: t.color }}>
                    {t.id === 'temp' && '🌡️'}
                    {t.id === 'hum_air' && '💨'}
                    {t.id === 'hum_sol' && '💧'}
                    {t.id === 'lum' && '☀️'}
                  </div>
                  <div>
                    <div className="threshold-name">{t.name}</div>
                    <div className="threshold-unit">Plage en {t.unit}</div>
                  </div>
                </div>
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    checked={t.active} 
                    onChange={() => toggleThreshold(t.id)} 
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="threshold-inputs">
                <div className="input-field">
                  <label>Minimum</label>
                  <input type="number" defaultValue={t.min} />
                </div>
                <div className="input-field">
                  <label>Maximum</label>
                  <input type="number" defaultValue={t.max} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rules-list">
          <div className="section-header">
            <div className="section-title">🤖 Règles d'automatisation</div>
          </div>
          {rules.map((r) => (
            <div key={r.id} className="rule-item">
              <div className="rule-icon">
                {r.condition.includes('Humidité') && '💧'}
                {r.condition.includes('Température') && '🌡️'}
                {r.condition.includes('Luminosité') && '☀️'}
              </div>
              <div className="rule-content">
                <div className="rule-text">Si <strong>{r.condition}</strong></div>
                <div className="rule-subtext">Alors : {r.action}</div>
              </div>
              <div className="rule-actions">
                <span className={`status-pill ${r.active ? 'active' : 'inactive'}`}>
                  {r.active ? 'Activé' : 'Désactivé'}
                </span>
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    checked={r.active} 
                    onChange={() => toggleRule(r.id)} 
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          ))}
          <button className="add-rule-btn">
            <span>+</span> Ajouter une nouvelle règle
          </button>
        </div>

        <div className="form-footer">
          <button className="btn-secondary">Réinitialiser</button>
          <button className="btn-primary">Enregistrer les modifications</button>
        </div>
      </div>
    </main>
  );
};

export default Seuils;
