import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  fr: {
    dashboard: "Tableau de bord",
    smartAgri: "Agriculture Intelligente",
    sensorsState: "État des Capteurs",
    trends24h: "Tendances 24h",
    activeControl: "Contrôle Actif",
    activityLog: "Journal d'Activités",
    optimal: "Optimal",
    alert: "Alerte",
    updatedAt: "Mise à jour",
    tempAir: "Température air",
    humSoil: "Humidité sol",
    lux: "Luminosité",
    humAir: "Humidité air",
    waterRes: "Réserve eau",
    co2: "CO₂",
    pump: "Pompe d'irrigation",
    ventilation: "Ventilation forcée",
    led: "Éclairage LED",
    active: "Actif",
    standby: "Veille",
    manual: "Manuel",
    auto: "Automatique",
    critique: "Critique",
    warning: "Avertissement",
    info: "Info",
    logout: "Déconnexion",
    language: "Langue",
    home: "Accueil",
    actuators: "Actionneurs",
    thresholds: "Seuils",
    login: "Connexion",
    loginPortal: "Portail de gestion agricole",
    email: "Adresse Email",
    password: "Mot de passe",
    co2Excess: "CO₂ excessif détecté",
    ventAuto: "Ventilation automatique activée",
    irrigationSched: "Irrigation programmée",
    ledCycle: "Éclairage LED activé selon le cycle lumineux",
  },
  en: {
    dashboard: "Dashboard",
    smartAgri: "Smart Agriculture",
    sensorsState: "Sensors Status",
    trends24h: "24h Trends",
    activeControl: "Active Control",
    activityLog: "Activity Log",
    optimal: "Optimal",
    alert: "Alert",
    updatedAt: "Updated at",
    tempAir: "Air Temperature",
    humSoil: "Soil Humidity",
    lux: "Luminosity",
    humAir: "Air Humidity",
    waterRes: "Water Reserve",
    co2: "CO₂",
    pump: "Irrigation Pump",
    ventilation: "Forced Ventilation",
    led: "LED Lighting",
    active: "Active",
    standby: "Standby",
    manual: "Manual",
    auto: "Auto",
    critique: "Critical",
    warning: "Warning",
    info: "Info",
    logout: "Logout",
    language: "Language",
    home: "Home",
    actuators: "Actuators",
    thresholds: "Thresholds",
    login: "Login",
    loginPortal: "Agricultural management portal",
    email: "Email Address",
    password: "Password",
    co2Excess: "Excessive CO₂ detected",
    ventAuto: "Automatic ventilation activated",
    irrigationSched: "Irrigation scheduled",
    ledCycle: "LED lighting activated per light cycle",
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('appLang') || 'fr');

  useEffect(() => {
    localStorage.setItem('appLang', lang);
  }, [lang]);

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
