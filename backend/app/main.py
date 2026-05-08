from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models import User, Mesure, Action, Alerte, SeuilConfig  # noqa: F401
from app.routes import auth, mesures, actionneurs, alertes, websocket, seuils, notifications, users
from app.core.data_buffer import add_to_buffer
from fastapi_mqtt import FastMQTT, MQTTConfig
from datetime import datetime
import asyncio
from collections import defaultdict
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="API REST — Système de surveillance agricole IoT",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000","http://172.20.10.12:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── MQTT ─────────────────────────────────────────────────────────────────────

config = MQTTConfig(
    host=settings.MQTT_BROKER,
    port=settings.MQTT_PORT,
    version=4,
)
mqtt = FastMQTT(config=config)
mqtt.init_app(app)

from app.core.mqtt_state import actuator_states

TOPIC_MAPPING = {
    "agri/temperature":  ("DHT22",  "temperature",  "°C"),
    "agri/humidite_air": ("DHT22",  "humidite_air", "%"),
    "agri/humidite_sol": ("YL-69",  "humidite_sol", "%"),
    "agri/luminosite":   ("LDR",    "luminosite",   "%"),
    "agri/gaz":          ("MQ-2",   "gaz",          "ppm"),
    "agri/lampe":        ("RELAIS", "lampe",        ""),
    "agri/ventilateur":  ("RELAIS", "ventilateur",  ""),
    "agri/niveau_eau": ("FLOTTEUR", "niveau_eau", ""),
    "agri/pompe":      ("RELAIS",   "pompe",      ""),
}

SEUILS = {
    "humidite_sol": {"min": 20.0,  "max": 90.0},
    "temperature":  {"min": 10.0,  "max": 40.0},
    "humidite_air": {"min": 30.0,  "max": 85.0},
    "luminosite":   {"min": 20.0,  "max": None},
    "gaz":          {"min": None,  "max": 500.0},
}

@mqtt.on_connect()
def connect(client, flags, rc, properties):
    print("\n[MQTT] ✅ Connecté à Mosquitto !")
    mqtt.client.subscribe("agri/#")
    print("[MQTT] 📡 Abonné à agri/#\n")

@mqtt.on_disconnect()
def disconnect(client, packet, exc=None):
    print("[MQTT] ❌ Déconnecté du broker")

@mqtt.on_message()
async def message(client, topic, payload, qos, properties):  # ← UNE SEULE fonction
    try:
        raw = payload.decode("utf-8").strip()

        # Conversion valeur : ON/OFF → 1.0/0.0, sinon float
        if raw == "ON":
            valeur = 1.0
        elif raw == "OFF":
            valeur = 0.0
        else:
            try:
                valeur = float(raw)
            except ValueError:
                print(f"[MQTT] ⚠️ Valeur non reconnue sur {topic} : {raw}")
                return

        if topic not in TOPIC_MAPPING:
            print(f"[MQTT] ⚠️  Topic inconnu ignoré : {topic}")
            return

        capteur, type_mesure, unite = TOPIC_MAPPING[topic]

        # Track actuator states from MQTT
        if type_mesure in actuator_states:
            actuator_states[type_mesure]["commande"] = bool(valeur)
            actuator_states[type_mesure]["timestamp"] = datetime.utcnow()

        # ── Affichage terminal ────────────────────────────────────
        print(f"\n[MQTT] 📥 Reçu → topic : {topic}")
        print(f"         valeur  : {valeur} {unite}")
        print(f"         capteur : {capteur} / {type_mesure}")

        # ── Ajout au buffer pour sauvegarde périodique ────────────────
        add_to_buffer(capteur, type_mesure, valeur, unite)

        # ── Broadcast WebSocket ───────────────────────────────────
        await websocket.broadcast({
            "capteur":     capteur,
            "type_mesure": type_mesure,
            "valeur":      valeur,
            "unite":       unite,
            "timestamp":   datetime.utcnow().isoformat(),
        })

    except ValueError:
        print(f"[MQTT] ❌ Valeur non numérique sur {topic} : {payload}")
    except Exception as e:
        print(f"[MQTT] ❌ Erreur inattendue : {e}")


# ─── ROUTES ───────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(mesures.router)
app.include_router(actionneurs.router)
app.include_router(alertes.router)
app.include_router(websocket.router)
app.include_router(seuils.router)
app.include_router(notifications.router)
app.include_router(users.router)

@app.get("/", tags=["Santé"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}