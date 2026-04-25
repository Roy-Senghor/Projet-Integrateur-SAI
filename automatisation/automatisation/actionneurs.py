"""
Gestion des actionneurs : pompe, ventilation, éclairage.
Envoie les commandes via MQTT ou HTTP selon la disponibilité.
"""

import json
from datetime import datetime

try:
    import paho.mqtt.publish as mqtt_publish
    MQTT_DISPONIBLE = True
except ImportError:
    MQTT_DISPONIBLE = False

try:
    import requests
    HTTP_DISPONIBLE = True
except ImportError:
    HTTP_DISPONIBLE = False


class GestionnaireActionneurs:
    """Contrôle les actionneurs de la serre via MQTT ou HTTP."""

    ACTIONNEURS = {
        "pompe":       {"label": "💧 Pompe d'arrosage", "etat": False},
        "ventilation": {"label": "🌀 Ventilation",      "etat": False},
        "eclairage":   {"label": "💡 Éclairage",        "etat": False},
    }

    def __init__(self, config, logger):
        self.config = config
        self.logger = logger
        self._historique = []

    # ── Méthodes publiques ──────────────────────────────────────────────

    def activer(self, nom: str) -> bool:
        return self._envoyer_commande(nom, True)

    def desactiver(self, nom: str) -> bool:
        return self._envoyer_commande(nom, False)

    def afficher_etats(self):
        print("\n  ┌─ État des actionneurs ──────────────────────┐")
        for nom, info in self.ACTIONNEURS.items():
            etat_str = "✅ ACTIVÉ " if info["etat"] else "⭕ DÉSACTIVÉ"
            print(f"  │  {info['label']:<25} {etat_str}")
        print("  └─────────────────────────────────────────────┘")

    def get_historique(self) -> list:
        return self._historique

    # ── Logique interne ──────────────────────────────────────────────────

    def _envoyer_commande(self, nom: str, activer: bool) -> bool:
        if nom not in self.ACTIONNEURS:
            self.logger.error(f"Actionneur inconnu : {nom}")
            print(f"  ❌ Actionneur '{nom}' inconnu.")
            return False

        action = "ON" if activer else "OFF"
        payload = json.dumps({"actionneur": nom, "commande": action,
                               "timestamp": datetime.now().isoformat()})
        label = self.ACTIONNEURS[nom]["label"]

        # Tentative MQTT
        succes = False
        if MQTT_DISPONIBLE:
            succes = self._envoyer_mqtt(nom, payload)

        # Fallback HTTP
        if not succes and HTTP_DISPONIBLE:
            succes = self._envoyer_http(nom, action)

        # Simulation si aucun transport dispo
        if not succes:
            succes = self._simulation(nom, action)

        if succes:
            self.ACTIONNEURS[nom]["etat"] = activer
            self._enregistrer_historique(nom, action, succes)
            icone = "✅" if activer else "⭕"
            print(f"\n  {icone}  {label} → {action}")
            self.logger.info(f"Actionneur {nom} → {action}")

        return succes

    def _envoyer_mqtt(self, nom: str, payload: str) -> bool:
        try:
            topic = getattr(self.config, f"TOPIC_{nom.upper()}")
            auth = None
            if self.config.MQTT_USERNAME:
                auth = {"username": self.config.MQTT_USERNAME,
                        "password": self.config.MQTT_PASSWORD}
            mqtt_publish.single(
                topic,
                payload=payload,
                hostname=self.config.MQTT_BROKER,
                port=self.config.MQTT_PORT,
                auth=auth
            )
            self.logger.debug(f"MQTT publié → {topic} : {payload}")
            return True
        except Exception as e:
            self.logger.warning(f"Échec MQTT ({nom}): {e}")
            return False

    def _envoyer_http(self, nom: str, action: str) -> bool:
        try:
            url = f"{self.config.API_BASE_URL}/actionneurs/{nom}"
            headers = {}
            if self.config.API_TOKEN:
                headers["Authorization"] = f"Bearer {self.config.API_TOKEN}"
            resp = requests.post(url, json={"commande": action}, headers=headers, timeout=5)
            if resp.status_code == 200:
                self.logger.debug(f"HTTP OK → {url}")
                return True
            self.logger.warning(f"HTTP {resp.status_code} pour {nom}")
            return False
        except Exception as e:
            self.logger.warning(f"Échec HTTP ({nom}): {e}")
            return False

    def _simulation(self, nom: str, action: str) -> bool:
        """Mode simulation quand MQTT et HTTP sont indisponibles."""
        print(f"  ⚠️  [SIMULATION] {nom} → {action} (aucun broker connecté)")
        self.logger.warning(f"[SIMULATION] Actionneur {nom} → {action}")
        return True

    def _enregistrer_historique(self, nom: str, action: str, succes: bool):
        self._historique.append({
            "timestamp": datetime.now().isoformat(),
            "actionneur": nom,
            "commande": action,
            "succes": succes
        })
