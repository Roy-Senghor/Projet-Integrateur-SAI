"""
Module de journalisation (logging).
Chaque exécution de script est enregistrée dans un fichier log.
"""

import logging
import os
from datetime import datetime
from config import Config


def setup_logger() -> logging.Logger:
    """
    Configure et retourne le logger principal de l'application.
    Les logs sont écrits à la fois dans la console et dans un fichier.
    """
    config = Config()

    logger = logging.getLogger("AgricultureAA")
    logger.setLevel(logging.DEBUG)

    # ---- Formateur ----
    fmt = logging.Formatter(
        fmt="[%(asctime)s] [%(levelname)-8s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # ---- Handler : fichier ----
    fh = logging.FileHandler(config.LOG_FILE, encoding="utf-8")
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(fmt)

    # ---- Handler : console (WARNING et + seulement) ----
    ch = logging.StreamHandler()
    ch.setLevel(logging.WARNING)
    ch.setFormatter(fmt)

    logger.addHandler(fh)
    logger.addHandler(ch)

    return logger


def lire_logs(nb_lignes: int = 50) -> list:
    """Retourne les N dernières lignes du fichier log du jour."""
    config = Config()
    log_file = config.LOG_FILE

    if not os.path.exists(log_file):
        return ["Aucun log disponible pour aujourd'hui."]

    with open(log_file, "r", encoding="utf-8") as f:
        lignes = f.readlines()

    return lignes[-nb_lignes:] if len(lignes) > nb_lignes else lignes


def lister_fichiers_logs() -> list:
    """Retourne la liste des fichiers de log disponibles."""
    config = Config()
    if not os.path.exists(config.LOG_DIR):
        return []
    fichiers = sorted(
        [f for f in os.listdir(config.LOG_DIR) if f.endswith(".log")],
        reverse=True
    )
    return fichiers
