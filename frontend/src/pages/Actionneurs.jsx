import React, { useState } from 'react';
import '../styles/dashboard.css';
import '../styles/actionneurs.css';

const Actionneurs = () => {
  const [devices, setDevices] = useState([
    { id: 1, name: 'Système d\'irrigation', type: 'Arrosage automatique', active: false, icon: '💧', status: 'Inactif', lastAction: 'Il y a 3 heures' },
    { id: 2, name: 'Lampes de croissance', type: 'Éclairage LED', active: true, icon: '💡', status: 'Actif', intensity: 75 },
    { id: 3, name: 'Ventilateurs', type: 'Circulation d\'air', active: false, icon: '💨', status: 'Inactif', speed: 50 },
    { id: 4, name: 'Pompe à eau', type: 'Distribution d\'eau', active: false, icon: '🌀', status: 'Inactif', info: 'Pression: 2.5 bar • Débit: 4.2 L/min' },
  ]);

  const toggleDevice = (id) => {
    setDevices(devices.map(d => {
      if (d.id === id) {
        const newActive = !d.active;
        return { 
          ...d, 
          active: newActive,
          status: newActive ? 'Actif' : 'Inactif'
        };
      }
      return d;
    }));
  };

  return (
    <main className="main">
      <div className="topbar">
        <div className="header-text">
          <h1>Actionneurs</h1>
          <p className="subtitle">Contrôlez vos équipements à distance</p>
        </div>
      </div>

      <div className="content">
        <div className="devices-grid">
          {devices.map((d) => (
            <div key={d.id} className={`device-card ${d.active ? 'active' : ''}`}>
              <div className="device-card-header">
                <div className="device-info">
                  <div className="device-icon-wrap">
                    <span className="device-icon">{d.icon}</span>
                  </div>
                  <div>
                    <div className="device-name">{d.name}</div>
                    <div className="device-type">{d.type}</div>
                  </div>
                </div>
                <label className="toggle">
                  <input 
                    type="checkbox" 
                    checked={d.active} 
                    onChange={() => toggleDevice(d.id)} 
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="device-status-row">
                <span className={`status-pill ${d.active ? 'active' : 'inactive'}`}>
                  {d.status}
                </span>
              </div>

              {d.intensity !== undefined && (
                <div className="control-section">
                  <div className="control-header">
                    <span>Intensité lumineuse</span>
                    <span>{d.intensity}%</span>
                  </div>
                  <input type="range" className="control-slider" defaultValue={d.intensity} />
                </div>
              )}

              {d.speed !== undefined && (
                <div className="control-section">
                  <div className="control-header">
                    <span>Vitesse du ventilateur</span>
                    <span>{d.speed}%</span>
                  </div>
                  <input type="range" className="control-slider" defaultValue={d.speed} />
                </div>
              )}

              {d.lastAction && (
                <div className="device-footer">
                  <span className="footer-icon">🕒</span> Dernière activation: {d.lastAction}
                </div>
              )}

              {d.info && (
                <div className="device-footer">
                  {d.info}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="quick-actions-section">
          <div className="section-header">
            <div className="section-title">⚡ Actions rapides</div>
            <p className="section-subtitle">Scénarios pré-configurés pour contrôler plusieurs équipements</p>
          </div>
          <div className="quick-actions-grid">
            <button className="action-btn">
              <div className="action-btn-name">Tout éteindre</div>
              <div className="action-btn-sub">Mode arrêt</div>
            </button>
            <button className="action-btn">
              <div className="action-btn-name">Mode nuit</div>
              <div className="action-btn-sub">Lampes OFF</div>
            </button>
            <button className="action-btn">
              <div className="action-btn-name">Économie d'énergie</div>
              <div className="action-btn-sub">Mode eco</div>
            </button>
            <button className="action-btn">
              <div className="action-btn-name">Arrosage urgent</div>
              <div className="action-btn-sub">Irrigation max</div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Actionneurs;
