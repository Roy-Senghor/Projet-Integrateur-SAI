"""
Configuration de l'Application d'Automatisation.
Centralise tous les paramètres du système.
"""

import os
import json
from datetime import datetime


class Config:
    """Classe de configuration centralisée."""

    # --- Connexion MQTT ---
    MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
    MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
    MQTT_USERNAME = os.getenv("MQTT_USERNAME", "")
    MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "")
    MQTT_TOPIC_BASE = "agriculture/"

    # Topics des actionneurs (publication)
    TOPIC_POMPE        = MQTT_TOPIC_BASE + "actionneurs/pompe"
    TOPIC_VENTILATION  = MQTT_TOPIC_BASE + "actionneurs/ventilation"
    TOPIC_ECLAIRAGE    = MQTT_TOPIC_BASE + "actionneurs/eclairage"

    # Topics des capteurs (souscription)
    TOPIC_HUMIDITE     = MQTT_TOPIC_BASE + "capteurs/humidite_sol"
    TOPIC_TEMPERATURE  = MQTT_TOPIC_BASE + "capteurs/temperature"
    TOPIC_CO2          = MQTT_TOPIC_BASE + "capteurs/co2"
    TOPIC_LUMINOSITE   = MQTT_TOPIC_BASE + "capteurs/luminosite"
    TOPIC_NIVEAU_EAU   = MQTT_TOPIC_BASE + "capteurs/niveau_eau"

    # --- Connexion HTTP (API Web) ---
    API_BASE_URL = os.getenv("API_URL", "http://localhost:5000/api")
    API_TOKEN    = os.getenv("API_TOKEN", "")

    # --- Base de données ---
    DB_HOST     = os.getenv("DB_HOST", "localhost")
    DB_PORT     = int(os.getenv("DB_PORT", 3306))
    DB_NAME     = os.getenv("DB_NAME", "agriculture_db")
    DB_USER     = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")

    # --- Seuils d'automatisation ---
    SEUIL_HUMIDITE_MIN   = 30    # % — en dessous : irrigation requise
    SEUIL_TEMPERATURE_MAX = 35   # °C — au-dessus : ventilation requise
    SEUIL_CO2_MAX        = 1000  # ppm — au-dessus : ventilation requise
    SEUIL_LUMINOSITE_MIN = 200   # lux — en dessous : éclairage requis
    SEUIL_EAU_MIN        = 20    # % — en dessous : réservoir presque vide

    # --- Logs ---
    LOG_DIR  = os.path.join(os.path.dirname(__file__), "logs")
    LOG_FILE = os.path.join(LOG_DIR, f"aa_{datetime.now().strftime('%Y%m%d')}.log")

    # --- Export CSV ---
    CSV_DIR = os.path.join(os.path.dirname(__file__), "exports")

    def __init__(self):
        # Créer les dossiers nécessaires
        os.makedirs(self.LOG_DIR, exist_ok=True)
        os.makedirs(self.CSV_DIR, exist_ok=True)

    def afficher_config(self):
        """Affiche la configuration active (sans mots de passe)."""
        print(f"""
  ┌─ Configuration active ──────────────────────┐
  │  MQTT Broker  : {self.MQTT_BROKER}:{self.MQTT_PORT}
  │  API URL      : {self.API_BASE_URL}
  │  Base de données : {self.DB_NAME}@{self.DB_HOST}
  │
  │  Seuils automatisation :
  │    Humidité sol  < {self.SEUIL_HUMIDITE_MIN}%   → arrosage
  │    Température   > {self.SEUIL_TEMPERATURE_MAX}°C  → ventilation
  │    CO2           > {self.SEUIL_CO2_MAX} ppm → ventilation
  │    Luminosité    < {self.SEUIL_LUMINOSITE_MIN} lux → éclairage
  │    Niveau eau    < {self.SEUIL_EAU_MIN}%   → alerte réservoir
  └─────────────────────────────────────────────┘""")



