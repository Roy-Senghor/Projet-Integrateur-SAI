# 🌿 Agriculture Intelligente — Application d'Automatisation (AA)
**Projet Intégrateur X2 — UCAC-ICAM**

---

## 📁 Structure du projet

```
agriculture_automatisation/
│
├── main.py              # Point d'entrée — lancer l'application
├── config.py            # Configuration (MQTT, HTTP, seuils)
├── menu.py              # Interface CLI interactive
├── actionneurs.py       # Contrôle pompe / ventilation / éclairage
├── capteurs.py          # Lecture humidité, température, CO2, etc.
├── automatisation.py    # Moteur de décision automatique
├── exporteur.py         # Export CSV de l'historique
├── logger.py            # Journalisation dans les fichiers log
├── requirements.txt     # Dépendances Python
│
├── logs/                # Fichiers log (créés automatiquement)
└── exports/             # Fichiers CSV exportés
```

---

## ⚙️ Installation

```bash
# 1. Cloner ou copier le dossier du projet
cd agriculture_automatisation

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Lancer l'application
python main.py
```

---

## 🔧 Configuration

Éditer `config.py` ou définir des variables d'environnement :

| Variable        | Défaut        | Description              |
|-----------------|---------------|--------------------------|
| `MQTT_BROKER`   | `localhost`   | Adresse du broker MQTT   |
| `MQTT_PORT`     | `1883`        | Port MQTT                |
| `API_URL`       | `http://localhost:5000/api` | URL de l'API backend |
| `DB_HOST`       | `localhost`   | Hôte base de données     |
| `DB_NAME`       | `agriculture_db` | Nom de la base        |

---

## 📡 Topics MQTT (ESP32)

| Actionneur   | Topic de publication                     |
|--------------|------------------------------------------|
| Pompe        | `agriculture/actionneurs/pompe`          |
| Ventilation  | `agriculture/actionneurs/ventilation`    |
| Éclairage    | `agriculture/actionneurs/eclairage`      |

| Capteur      | Topic de souscription                    |
|--------------|------------------------------------------|
| Humidité sol | `agriculture/capteurs/humidite_sol`      |
| Température  | `agriculture/capteurs/temperature`       |
| CO2          | `agriculture/capteurs/co2`               |
| Luminosité   | `agriculture/capteurs/luminosite`        |
| Niveau eau   | `agriculture/capteurs/niveau_eau`        |

---

## 🤖 Règles d'automatisation

| Capteur      | Seuil           | Action déclenchée        |
|--------------|-----------------|--------------------------|
| Humidité sol | < 30%           | Pompe → ON               |
| Température  | > 35°C          | Ventilation → ON         |
| CO2          | > 1000 ppm      | Ventilation → ON         |
| Luminosité   | < 200 lux       | Éclairage → ON           |
| Niveau eau   | < 20%           | ⚠️ Alerte réservoir       |

---

## 🗂️ Logs

Les logs sont enregistrés dans `logs/aa_YYYYMMDD.log`.  
Un nouveau fichier est créé chaque jour automatiquement.

---

## 📊 Export CSV

Les exports sont sauvegardés dans `exports/historique_YYYYMMDD_HHMMSS.csv`.

---

*Application développée en Python 3 — Compatible Windows, Linux, macOS*
