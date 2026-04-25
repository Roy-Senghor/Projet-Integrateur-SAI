"""
Lecture des données capteurs depuis MQTT ou HTTP.
Capteurs : humidité sol, température, CO2, luminosité, niveau d'eau.
"""

import json
import random
from datetime import datetime

try:
    import requests
    HTTP_DISPONIBLE = True
except ImportError:
    HTTP_DISPONIBLE = False


class GestionnaireCapteurs:
    """Lit les données des capteurs de la serre."""

    def __init__(self, config, logger):
        self.config = config
        self.logger = logger
        self._derniere_lecture = {}

    def lire_tous(self) -> dict:
        """Lit tous les capteurs et affiche les valeurs."""
        donnees = {}

        capteurs = [
            ("humidite",    "💧 Humidité sol",   "%",   self._lire_humidite),
            ("temperature", "🌡️  Température",    "°C",  self._lire_temperature),
            ("co2",         "🫧  CO2",            "ppm", self._lire_co2),
            ("luminosite",  "☀️  Luminosité",     "lux", self._lire_luminosite),
            ("niveau_eau",  "🪣 Niveau eau",      "%",   self._lire_niveau_eau),
        ]

        print("  ┌─ Données capteurs ──────────────────────────┐")
        for cle, label, unite, fn_lecture in capteurs:
            valeur = fn_lecture()
            donnees[cle] = valeur
            self._derniere_lecture[cle] = valeur
            alerte = self._verifier_alerte(cle, valeur)
            flag = f"  ⚠️  {alerte}" if alerte else ""
            print(f"  │  {label:<22} {valeur:>6.1f} {unite}{flag}")

        print("  └─────────────────────────────────────────────┘")
        print(f"  🕐  Relevé effectué le {datetime.now().strftime('%d/%m/%Y à %H:%M:%S')}\n")

        self.logger.info(f"Capteurs lus : {json.dumps(donnees)}")
        return donnees

    def derniere_lecture(self) -> dict:
        """Retourne la dernière lecture disponible."""
        if not self._derniere_lecture:
            return self.lire_tous()
        return self._derniere_lecture

    # ── Lecture individuelle (HTTP → simulation) ─────────────────────────

    def _lire_capteur_http(self, nom: str, simulation_fn) -> float:
        if HTTP_DISPONIBLE:
            try:
                url = f"{self.config.API_BASE_URL}/capteurs/{nom}"
                headers = {}
                if self.config.API_TOKEN:
                    headers["Authorization"] = f"Bearer {self.config.API_TOKEN}"
                resp = requests.get(url, headers=headers, timeout=3)
                if resp.status_code == 200:
                    data = resp.json()
                    return float(data.get("valeur", simulation_fn()))
            except Exception as e:
                self.logger.debug(f"Capteur {nom} HTTP échoué : {e}")
        return simulation_fn()

    def _lire_humidite(self) -> float:
        return self._lire_capteur_http("humidite_sol",
            lambda: round(random.uniform(20.0, 80.0), 1))

    def _lire_temperature(self) -> float:
        return self._lire_capteur_http("temperature",
            lambda: round(random.uniform(18.0, 40.0), 1))

    def _lire_co2(self) -> float:
        return self._lire_capteur_http("co2",
            lambda: round(random.uniform(400.0, 1500.0), 0))

    def _lire_luminosite(self) -> float:
        return self._lire_capteur_http("luminosite",
            lambda: round(random.uniform(50.0, 1000.0), 0))

    def _lire_niveau_eau(self) -> float:
        return self._lire_capteur_http("niveau_eau",
            lambda: round(random.uniform(10.0, 100.0), 1))

    # ── Vérification des seuils ──────────────────────────────────────────

    def _verifier_alerte(self, cle: str, valeur: float) -> str:
        seuils = {
            "humidite":    (self.config.SEUIL_HUMIDITE_MIN, None,
                            "Humidité trop basse → arrosage requis"),
            "temperature": (None, self.config.SEUIL_TEMPERATURE_MAX,
                            "Température trop haute → ventilation requise"),
            "co2":         (None, self.config.SEUIL_CO2_MAX,
                            "CO2 trop élevé → ventilation requise"),
            "luminosite":  (self.config.SEUIL_LUMINOSITE_MIN, None,
                            "Luminosité faible → éclairage requis"),
            "niveau_eau":  (self.config.SEUIL_EAU_MIN, None,
                            "Réservoir presque vide !"),
        }
        if cle not in seuils:
            return ""
        min_val, max_val, msg = seuils[cle]
        if min_val is not None and valeur < min_val:
            return msg
        if max_val is not None and valeur > max_val:
            return msg
        return ""
