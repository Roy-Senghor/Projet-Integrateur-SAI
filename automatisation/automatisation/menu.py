"""
Menu principal de l'Application d'Automatisation (CLI).
"""

import time
from actionneurs import GestionnaireActionneurs
from capteurs import GestionnaireCapteurs
from automatisation import MoteurAutomatisation
from exporteur import Exporteur
from logger import lire_logs, lister_fichiers_logs


class MenuPrincipal:
    def __init__(self, config, logger):
        self.config = config
        self.logger = logger
        self.actionneurs = GestionnaireActionneurs(config, logger)
        self.capteurs = GestionnaireCapteurs(config, logger)
        self.automatisation = MoteurAutomatisation(config, logger, self.actionneurs, self.capteurs)
        self.exporteur = Exporteur(config, logger)

    def lancer(self):
        while True:
            self._afficher_menu()
            choix = input("\n  Votre choix : ").strip()

            if choix == "1":
                self._menu_actionneurs()
            elif choix == "2":
                self._menu_capteurs()
            elif choix == "3":
                self._menu_automatisation()
            elif choix == "4":
                self._menu_historique()
            elif choix == "5":
                self._menu_export()
            elif choix == "6":
                self.config.afficher_config()
            elif choix == "0":
                break
            else:
                print("  ⚠️  Choix invalide. Veuillez réessayer.")

    def _afficher_menu(self):
        print("""
  ┌─────────────────────────────────────────────┐
  │          MENU PRINCIPAL                      │
  ├─────────────────────────────────────────────┤
  │  1. 🔧  Contrôle manuel des actionneurs      │
  │  2. 📡  Lecture des capteurs                 │
  │  3. 🤖  Automatisation intelligente          │
  │  4. 📋  Historique et logs                   │
  │  5. 📊  Export CSV / Rapport                 │
  │  6. ⚙️   Configuration système               │
  │  0. 🚪  Quitter                              │
  └─────────────────────────────────────────────┘""")

    def _menu_actionneurs(self):
        while True:
            print("""
  ┌─ Contrôle des Actionneurs ──────────────────┐
  │  1. 💧  Pompe d'arrosage                    │
  │  2. 🌀  Ventilation                         │
  │  3. 💡  Éclairage                           │
  │  4. 📋  État de tous les actionneurs        │
  │  0. ↩️   Retour                              │
  └─────────────────────────────────────────────┘""")
            choix = input("  Votre choix : ").strip()
            if choix == "1":
                self._controle_actionneur("pompe", "💧 Pompe d'arrosage")
            elif choix == "2":
                self._controle_actionneur("ventilation", "🌀 Ventilation")
            elif choix == "3":
                self._controle_actionneur("eclairage", "💡 Éclairage")
            elif choix == "4":
                self.actionneurs.afficher_etats()
            elif choix == "0":
                break

    def _controle_actionneur(self, nom, label):
        print(f"\n  {label}")
        print("    1. Activer")
        print("    2. Désactiver")
        print("    0. Retour")
        choix = input("  Votre choix : ").strip()
        if choix == "1":
            self.actionneurs.activer(nom)
        elif choix == "2":
            self.actionneurs.desactiver(nom)

    def _menu_capteurs(self):
        print("\n  📡 Lecture des capteurs en cours...\n")
        self.capteurs.lire_tous()

    def _menu_automatisation(self):
        while True:
            print("""
  ┌─ Automatisation Intelligente ───────────────┐
  │  1. ▶️   Lancer une analyse automatique      │
  │  2. 🔁  Mode surveillance continue (60s)    │
  │  0. ↩️   Retour                              │
  └─────────────────────────────────────────────┘""")
            choix = input("  Votre choix : ").strip()
            if choix == "1":
                self.automatisation.analyser_et_agir()
            elif choix == "2":
                print("\n  🔁  Surveillance active. (Ctrl+C pour arrêter)\n")
                try:
                    while True:
                        self.automatisation.analyser_et_agir()
                        print("  ⏳  Prochaine analyse dans 60 secondes...")
                        time.sleep(60)
                except KeyboardInterrupt:
                    print("\n  ⏹️   Surveillance arrêtée.")
            elif choix == "0":
                break

    def _menu_historique(self):
        while True:
            print("""
  ┌─ Historique & Logs ─────────────────────────┐
  │  1. 📄  Voir les 30 dernières lignes du log  │
  │  2. 📁  Lister les fichiers de log           │
  │  0. ↩️   Retour                               │
  └─────────────────────────────────────────────┘""")
            choix = input("  Votre choix : ").strip()
            if choix == "1":
                lignes = lire_logs(30)
                print("\n" + "".join(lignes))
            elif choix == "2":
                fichiers = lister_fichiers_logs()
                if fichiers:
                    for f in fichiers:
                        print(f"  - {f}")
                else:
                    print("  Aucun fichier de log trouvé.")
            elif choix == "0":
                break

    def _menu_export(self):
        while True:
            print("""
  ┌─ Export & Rapports ─────────────────────────┐
  │  1. 📊  Exporter l'historique CSV            │
  │  0. ↩️   Retour                               │
  └─────────────────────────────────────────────┘""")
            choix = input("  Votre choix : ").strip()
            if choix == "1":
                self.exporteur.exporter_csv()
            elif choix == "0":
                break
