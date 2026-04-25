#!/usr/bin/env python3
"""
====================================================
  Agriculture Intelligente - Application d'Automatisation (AA)
  Projet Intégrateur X2 - UCAC-ICAM
====================================================
  Interface CLI pour le contrôle des actionneurs
  (arrosage, ventilation, éclairage) via MQTT/HTTP
"""

import os
import sys
import time
import logging
from datetime import datetime

from config import Config
from logger import setup_logger
from menu import MenuPrincipal


def afficher_banniere():
    """Affiche la bannière de démarrage."""
    print("""
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║        🌿  AGRICULTURE INTELLIGENTE  🌿                  ║
║         Application d'Automatisation (AA)                ║
║                                                          ║
║         UCAC-ICAM — Projet Intégrateur X2                ║
╚══════════════════════════════════════════════════════════╝
""")


def main():
    """Point d'entrée principal de l'application."""
    afficher_banniere()

    # Initialisation du logger
    logger = setup_logger()
    logger.info("=== Démarrage de l'Application d'Automatisation ===")

    # Chargement de la configuration
    config = Config()

    # Lancement du menu principal
    menu = MenuPrincipal(config, logger)
    menu.lancer()

    logger.info("=== Arrêt de l'Application d'Automatisation ===")
    print("\n👋  Au revoir !")


if __name__ == "__main__":
    main()
