import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import '../styles/dashboard.css';
import '../styles/seuils.css';

const Seuils = () => {
  const { t, tObj } = useLanguage();
  const p = tObj.seuilsPage || {};
  
  const [thresholds, setThresholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadThresholds();
  }, []);

  const loadThresholds = async () => {
    try {
      const response = await api.get('/seuils');
      const seuils = response.data || [];
      
      // Map backend data to frontend format
      const thresholdMap = {
        'temperature': { id: 'temp', name: 'Température', unit: '°C', color: '#f97316' },
        'humidite_air': { id: 'hum_air', name: 'Humidité de l\'air', unit: '%', color: '#3b82f6' },
        'humidite_sol': { id: 'hum_sol', name: 'Humidité du sol', unit: '%', color: '#0ea5e9' },
        'luminosite': { id: 'lum', name: 'Luminosité', unit: 'lux', color: '#f59e0b' },
        'gaz': { id: 'gaz', name: 'Gaz/CO2', unit: 'ppm', color: '#8b5cf6' },
      };

      const mappedThresholds = seuils.map(s => {
        const info = thresholdMap[s.type_mesure] || { 
          id: s.type_mesure, 
          name: s.type_mesure, 
          unit: s.unite || '', 
          color: '#64748b' 
        };
        return {
          id: info.id,
          type_mesure: s.type_mesure,
          name: info.name,
          unit: info.unit,
          min: s.valeur_min,
          max: s.valeur_max,
          active: s.actif,
          color: info.color,
        };
      });

      // If no thresholds in database, use defaults
      if (mappedThresholds.length === 0) {
        setThresholds([
          { id: 'temp', type_mesure: 'temperature', name: 'Température', unit: '°C', min: 18, max: 30, active: true, color: '#f97316' },
          { id: 'hum_air', type_mesure: 'humidite_air', name: 'Humidité de l\'air', unit: '%', min: 30, max: 70, active: true, color: '#3b82f6' },
          { id: 'hum_sol', type_mesure: 'humidite_sol', name: 'Humidité du sol', unit: '%', min: 35, max: 80, active: true, color: '#0ea5e9' },
          { id: 'lum', type_mesure: 'luminosite', name: 'Luminosité', unit: 'lux', min: 300, max: 1000, active: true, color: '#f59e0b' },
          { id: 'gaz', type_mesure: 'gaz', name: 'Gaz/CO2', unit: 'ppm', min: 0, max: 500, active: true, color: '#8b5cf6' },
        ]);
      } else {
        setThresholds(mappedThresholds);
      }
    } catch (error) {
      console.error('Error loading thresholds:', error);
      // Use defaults on error
      setThresholds([
        { id: 'temp', type_mesure: 'temperature', name: 'Température', unit: '°C', min: 18, max: 30, active: true, color: '#f97316' },
        { id: 'hum_air', type_mesure: 'humidite_air', name: 'Humidité de l\'air', unit: '%', min: 30, max: 70, active: true, color: '#3b82f6' },
        { id: 'hum_sol', type_mesure: 'humidite_sol', name: 'Humidité du sol', unit: '%', min: 35, max: 80, active: true, color: '#0ea5e9' },
        { id: 'lum', type_mesure: 'luminosite', name: 'Luminosité', unit: 'lux', min: 300, max: 1000, active: true, color: '#f59e0b' },
        { id: 'gaz', type_mesure: 'gaz', name: 'Gaz/CO2', unit: 'ppm', min: 0, max: 500, active: true, color: '#8b5cf6' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveThresholds = async () => {
    setSaving(true);
    try {
      for (const threshold of thresholds) {
        await api.put(`/seuils/${threshold.type_mesure}`, {
          valeur_min: threshold.min,
          valeur_max: threshold.max,
          actif: threshold.active,
        });
      }
      alert(p.saveSuccess || 'Seuils enregistrés avec succès!');
    } catch (error) {
      console.error('Error saving thresholds:', error);
      alert(p.saveError || 'Erreur lors de l\'enregistrement des seuils');
    } finally {
      setSaving(false);
    }
  };

  const updateThreshold = (id, field, value) => {
    setThresholds(thresholds.map(threshold => threshold.id === id ? { ...threshold, [field]: value } : threshold));
  };

  const toggleThreshold = (id) => {
    setThresholds(thresholds.map(threshold => threshold.id === id ? { ...threshold, active: !threshold.active } : threshold));
  };

  const [rules, setRules] = useState([
    { id: 1, condition: 'Humidité du sol < 30%', action: 'Activer irrigation', active: true },
    { id: 2, condition: 'Température > 28°C', action: 'Activer ventilation', active: true },
    { id: 3, condition: 'Luminosité < 400 lux', action: 'Activer lampes de croissance', active: false },
  ]);

  const toggleRule = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  if (loading) {
    return (
      <div className="se-page">
        <div className="se-hero">
          <div className="se-hero-overlay" />
          <div className="se-hero-body">
            <h1 className="se-hero-title">{t('thresholdTitle')}</h1>
            <p className="se-hero-sub">{t('thresholdSubtitle')}</p>
          </div>
        </div>
        <div className="se-content">
          <div style={{ padding: '40px', textAlign: 'center' }}>{p.loading || 'Chargement...'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="se-page">
      {/* ══ HERO ══ */}
      <div className="se-hero">
        <div className="se-hero-overlay" />
        <div className="se-hero-body">
          <div className="se-crumb">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
              <path d="M2 20h20"/><path d="M6 20V10"/><path d="M10 20V4"/><path d="M14 20V14"/><path d="M18 20V8"/>
            </svg>
            Configuration
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="se-hero-title">{t('thresholdTitle')}</h1>
              <p className="se-hero-sub">{t('thresholdSubtitle')}</p>
            </div>
            <button className="btn btn-primary" onClick={saveThresholds} disabled={saving} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              {saving ? (p.saving || 'Enregistrement...') : (p.saveChanges || 'Enregistrer les modifications')}
            </button>
          </div>
        </div>
      </div>

      <div className="se-content">
        <div className="thresholds-grid">
          {thresholds.map((threshold) => (
            <div key={threshold.id} className="threshold-card" style={{ borderLeft: `4px solid ${threshold.color}` }}>
              <div className="threshold-card-header">
                <div className="threshold-info">
                  <div className="threshold-icon" style={{ background: threshold.color + '15', color: threshold.color }}>
                    {threshold.id === 'temp' && '🌡️'}
                    {threshold.id === 'hum_air' && '💨'}
                    {threshold.id === 'hum_sol' && '💧'}
                    {threshold.id === 'lum' && '☀️'}
                  </div>
                  <div>
                    <div className="threshold-name">{t(threshold.id) || threshold.name}</div>
                    <div className="threshold-unit">{p.rangeIn || 'Plage en'} {threshold.unit}</div>
                  </div>
                </div>
              </div>
              <div className="threshold-inputs">
                <div className="input-field">
                  <label>{p.min || 'Minimum'}</label>
                  <input 
                    type="number" 
                    value={threshold.min} 
                    onChange={(e) => updateThreshold(threshold.id, 'min', parseFloat(e.target.value))}
                  />
                </div>
                <div className="input-field">
                  <label>{p.max || 'Maximum'}</label>
                  <input 
                    type="number" 
                    value={threshold.max} 
                    onChange={(e) => updateThreshold(threshold.id, 'max', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rules-list">
          <div className="section-header">
            <div className="section-title">{p.automationRules || "🤖 Règles d'automatisation"}</div>
          </div>
          {rules.map((r) => (
            <div key={r.id} className="rule-item">
              <div className="rule-icon">
                {r.condition.includes('Humidité') && '💧'}
                {r.condition.includes('Température') && '🌡️'}
                {r.condition.includes('Luminosité') && '☀️'}
              </div>
              <div className="rule-content">
                <div className="rule-text">{p.ifCond || 'Si'} <strong>{r.condition}</strong></div>
                <div className="rule-subtext">{p.thenCond || 'Alors :'} {r.action}</div>
              </div>
              <div className="rule-actions">
                <span className={`status-pill ${r.active ? 'active' : 'inactive'}`}>
                  {r.active ? (p.activated || 'Activé') : (p.deactivated || 'Désactivé')}
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
            <span>+</span> {p.addNewRule || 'Ajouter une nouvelle règle'}
          </button>
        </div>

        <div className="form-footer" style={{ marginTop: '30px' }}>
          <button className="btn-secondary" onClick={loadThresholds}>{t('reset') || 'Réinitialiser'}</button>
          <button className="btn-primary" onClick={saveThresholds} disabled={saving}>
            {saving ? (p.saving || 'Enregistrement...') : (p.saveChanges || 'Enregistrer les modifications')}
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .se-page { flex:1; background:#f4f6f3; font-family:'DM Sans', sans-serif; min-height:100vh; -webkit-font-smoothing: antialiased; }
        
        /* ══ HERO ══ */
        .se-hero {
          position: relative;
          height: 210px;
          background: linear-gradient(135deg, #1a3a1f 0%, #2d6a35 50%, #3a8c45 100%);
          overflow: hidden;
        }
        .se-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            radial-gradient(ellipse 50% 60% at 80% 10%, rgba(255,255,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 5% 90%,  rgba(0,0,0,0.12) 0%, transparent 50%);
        }
        .se-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.3) 100%);
        }
        .se-hero-body {
          position: relative; z-index: 2;
          padding: 28px 32px 0;
        }
        .se-crumb {
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
        .se-hero-title {
          font-size: 2rem; font-weight: 700;
          color: white; letter-spacing: -0.5px;
          line-height: 1.15; margin-bottom: 4px;
        }
        .se-hero-sub {
          font-size: 0.8rem; color: rgba(255,255,255,0.65);
          margin-bottom: 20px;
        }

        .se-content { padding: 20px 28px 48px; display: flex; flex-direction: column; gap: 20px; }
        
        .thresholds-grid { 
          display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; 
          margin-top: -48px; position: relative; z-index: 10;
        }

        .threshold-card { 
          background: white; border-radius: 16px; padding: 24px; 
          box-shadow: 0 4px 14px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s;
        }
        .threshold-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        
        .threshold-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .threshold-info { display: flex; gap: 12px; align-items: center; }
        .threshold-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
        .threshold-name { font-weight: 700; font-size: 1.05rem; color: #111827; }
        .threshold-unit { font-size: 0.8rem; color: #6b7280; margin-top: 2px; }
        
        .threshold-inputs { display: flex; gap: 16px; }
        .input-field { flex: 1; }
        .input-field label { display: block; font-size: 0.75rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .input-field input { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 1rem; font-weight: 600; color: #111827; transition: 0.2s; outline: none; }
        .input-field input:focus { border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
        
        .rules-list { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.03); margin-top: 10px; }
        .section-header { margin-bottom: 20px; }
        .section-title { font-size: 1.2rem; font-weight: 700; color: #111827; }
        
        .rule-item { display: flex; align-items: center; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 12px; transition: 0.2s; }
        .rule-item:hover { border-color: #d1d5db; background: #f9fafb; }
        .rule-icon { width: 40px; height: 40px; border-radius: 10px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; margin-right: 16px; }
        .rule-content { flex: 1; }
        .rule-text { font-size: 0.95rem; color: #374151; }
        .rule-text strong { color: #111827; font-weight: 600; }
        .rule-subtext { font-size: 0.85rem; color: #6b7280; margin-top: 4px; font-weight: 500; }
        .rule-actions { display: flex; align-items: center; gap: 16px; }
        
        .status-pill { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-pill.active { background: #dcfce7; color: #166534; }
        .status-pill.inactive { background: #f3f4f6; color: #4b5563; }
        
        .add-rule-btn { width: 100%; padding: 14px; border: 2px dashed #d1d5db; border-radius: 12px; background: transparent; color: #6b7280; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; }
        .add-rule-btn:hover { border-color: #9ca3af; color: #374151; background: #f9fafb; }
        .add-rule-btn span { font-size: 1.2rem; }
        
        .form-footer { display: flex; justify-content: flex-end; gap: 16px; padding: 24px; background: white; border-radius: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.03); }
        
        .toggle { position: relative; display: inline-block; width: 44px; height: 24px; }
        .toggle input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .3s; border-radius: 24px; }
        .toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        input:checked + .toggle-slider { background-color: #22c55e; }
        input:checked + .toggle-slider:before { transform: translateX(20px); }

        .btn { padding:10px 20px; border-radius:10px; font-weight:600; font-size:0.9rem; cursor:pointer; border:none; transition:0.2s; font-family: 'DM Sans', sans-serif; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-primary { background:#1a4a26; color:white; padding:10px 20px; border-radius:10px; font-weight:600; font-size:0.9rem; cursor:pointer; border:none; transition:0.2s; }
        .btn-primary:hover { background:#2b7e3b; transform: translateY(-1px); }
        .btn-secondary { background:white; color:#4b5563; border:1px solid #d1d5db; padding:10px 20px; border-radius:10px; font-weight:600; font-size:0.9rem; cursor:pointer; transition:0.2s; }
        .btn-secondary:hover { background:#f9fafb; border-color: #9ca3af; color: #111827; }

        @media (max-width: 768px) {
          .se-hero { height: 200px; }
          .se-hero-body { padding: 20px 20px 0; }
          .se-hero-title { font-size: 1.6rem; }
          .se-content { padding: 14px 16px 36px; }
          .thresholds-grid { margin-top: -36px; grid-template-columns: 1fr; }
          .rule-item { flex-direction: column; align-items: flex-start; gap: 12px; }
          .rule-actions { width: 100%; justify-content: space-between; margin-top: 8px; }
          .form-footer { flex-direction: column-reverse; }
          .form-footer button { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Seuils;
