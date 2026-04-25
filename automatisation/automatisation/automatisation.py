"""
Moteur d'automatisation intelligente.
Analyse les données capteurs et décide des actions à effectuer.
"""

from datetime import datetime


class MoteurAutomatisation:
    """Prend des décisions automatiques basées sur les seuils configurés."""

    def __init__(self, config, logger, actionneurs, capteurs):
        self.config = config
        self.logger = logger
        self.actionneurs = actionneurs
        self.capteurs = capteurs

    def analyser_et_agir(self):
        """
        Lit les capteurs, compare aux seuils et active/désactive
        les actionneurs en conséquence.
        """
        print("\n  🤖  Analyse automatique en cours...\n")
        self.logger.info("Analyse automatique déclenchée")

        donnees = self.capteurs.lire_tous()
        actions = []

        # ── Règle 1 : Irrigation ──────────────────────────────────────────
        if donnees.get("humidite", 100) < self.config.SEUIL_HUMIDITE_MIN:
            print(f"  💧  Humidité sol = {donnees['humidite']}% "
                  f"< seuil {self.config.SEUIL_HUMIDITE_MIN}% → Activation pompe")
            self.actionneurs.activer("pompe")
            actions.append("pompe:ON")
        else:
            self.actionneurs.desactiver("pompe")
            actions.append("pompe:OFF")

        # ── Règle 2 : Ventilation (température) ──────────────────────────
        ventilation_requise = False
        if donnees.get("temperature", 0) > self.config.SEUIL_TEMPERATURE_MAX:
            print(f"  🌡️   Température = {donnees['temperature']}°C "
                  f"> seuil {self.config.SEUIL_TEMPERATURE_MAX}°C → Ventilation ON")
            ventilation_requise = True

        # ── Règle 3 : Ventilation (CO2) ──────────────────────────────────
        if donnees.get("co2", 0) > self.config.SEUIL_CO2_MAX:
            print(f"  🫧   CO2 = {donnees['co2']} ppm "
                  f"> seuil {self.config.SEUIL_CO2_MAX} ppm → Ventilation ON")
            ventilation_requise = True

        if ventilation_requise:
            self.actionneurs.activer("ventilation")
            actions.append("ventilation:ON")
        else:
            self.actionneurs.desactiver("ventilation")
            actions.append("ventilation:OFF")

        # ── Règle 4 : Éclairage ───────────────────────────────────────────
        if donnees.get("luminosite", 1000) < self.config.SEUIL_LUMINOSITE_MIN:
            print(f"  💡  Luminosité = {donnees['luminosite']} lux "
                  f"< seuil {self.config.SEUIL_LUMINOSITE_MIN} lux → Éclairage ON")
            self.actionneurs.activer("eclairage")
            actions.append("eclairage:ON")
        else:
            self.actionneurs.desactiver("eclairage")
            actions.append("eclairage:OFF")

        # ── Alerte niveau eau ─────────────────────────────────────────────
        if donnees.get("niveau_eau", 100) < self.config.SEUIL_EAU_MIN:
            print(f"\n  ⚠️   ALERTE : Réservoir d'eau à {donnees['niveau_eau']}% — "
                  f"Remplissage requis !")
            self.logger.warning(f"Niveau eau critique : {donnees['niveau_eau']}%")

        # ── Résumé ────────────────────────────────────────────────────────
        print(f"\n  ✅  Analyse terminée à {datetime.now().strftime('%H:%M:%S')}")
        print(f"  📋  Actions : {' | '.join(actions)}")
        self.logger.info(f"Actions automatiques : {', '.join(actions)}")
