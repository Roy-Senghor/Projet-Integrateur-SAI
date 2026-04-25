"""
Module d'exportation CSV de l'historique des actions et capteurs.
"""

import csv
import os
from datetime import datetime


class Exporteur:
    """Exporte les données vers des fichiers CSV."""

    def __init__(self, config, logger):
        self.config = config
        self.logger = logger

    def exporter_csv(self, donnees: list = None) -> str:
        """
        Exporte l'historique vers un fichier CSV horodaté.
        Retourne le chemin du fichier créé.
        """
        horodatage = datetime.now().strftime("%Y%m%d_%H%M%S")
        nom_fichier = f"historique_{horodatage}.csv"
        chemin = os.path.join(self.config.CSV_DIR, nom_fichier)

        if donnees is None:
            # Données d'exemple si aucune donnée fournie
            donnees = self._donnees_exemple()

        colonnes = ["timestamp", "actionneur", "commande", "succes"]

        try:
            with open(chemin, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=colonnes)
                writer.writeheader()
                writer.writerows(donnees)

            print(f"\n  ✅  Export réussi : {chemin}")
            self.logger.info(f"Export CSV : {chemin} ({len(donnees)} lignes)")
            return chemin

        except Exception as e:
            print(f"\n  ❌  Erreur export : {e}")
            self.logger.error(f"Erreur export CSV : {e}")
            return ""

    def _donnees_exemple(self) -> list:
        """Génère des données exemple pour l'export."""
        now = datetime.now().isoformat()
        return [
            {"timestamp": now, "actionneur": "pompe",       "commande": "ON",  "succes": True},
            {"timestamp": now, "actionneur": "ventilation", "commande": "OFF", "succes": True},
            {"timestamp": now, "actionneur": "eclairage",   "commande": "ON",  "succes": True},
        ]
