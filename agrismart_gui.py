#!/usr/bin/env python3
"""
AgriSmart CLI — Interface Graphique Terminal
Version 3.1.0
"""

import tkinter as tk
from tkinter import font
import threading
import time
import datetime

# ── Couleurs ──────────────────────────────────────────────────────────
BG        = "#0d1a0d"
BG_DARK   = "#0a0f0a"
BG_BAR    = "#111f11"
GREEN     = "#4ade80"
GREEN_DIM = "#166534"
YELLOW    = "#fbbf24"
BLUE      = "#67e8f9"
RED       = "#f87171"
WHITE     = "#e2e8e2"
DIM       = "#4b6652"
MUTED     = "#2a4a2a"
DEFAULT   = "#c8e6c8"

COLOR_MAP = {
    "green": GREEN, "yellow": YELLOW, "blue": BLUE,
    "red": RED, "white": WHITE, "dim": DIM, "muted": MUTED,
}

# ── Commandes ─────────────────────────────────────────────────────────
def get_commands():
    return {
        "help": [
            ("┌─ Commandes disponibles ─────────────────────────────────────┐", "muted"),
            ("│", "muted"),
            ("│  help          Afficher cette aide", "white"),
            ("│  clear         Effacer l'écran", "white"),
            ("│  about         À propos d'AgriSmart", "white"),
            ("│  status        État du système et des capteurs", "white"),
            ("│  meteo         Météo agricole en temps réel", "white"),
            ("│  cultures      Liste des cultures disponibles", "white"),
            ("│  sol           Analyse des données de sol", "white"),
            ("│  alerte        Alertes phytosanitaires actives", "white"),
            ("│  recolte       Prévisions de récolte", "white"),
            ("│  capteurs      État des capteurs terrain", "white"),
            ("│  date          Date et heure système", "white"),
            ("│  echo [msg]    Répéter un message", "white"),
            ("│  exit          Fermer la session", "white"),
            ("│", "muted"),
            ("└──────────────────────────────────────────────────────────────┘", "muted"),
            ("", ""),
        ],
        "about": [
            ("", ""),
            ("AgriSmart — Système d'Intelligence Agricole", "green"),
            ("─────────────────────────────────────────────", "muted"),
            ("Version     : 3.1.0", "dim"),
            ("Moteur IA   : AgriModel Pro v2", "dim"),
            ("Couverture  : Afrique Centrale & Ouest", "dim"),
            ("Langues     : Français, Anglais, Haoussa", "dim"),
            ("Développeur : AgriSmart Technologies Inc.", "dim"),
            ("Contact     : support@agrismart.io", "dim"),
            ("", ""),
            ("AgriSmart combine l'IA, les données satellitaires et les", "white"),
            ("capteurs IoT pour optimiser vos rendements agricoles.", "white"),
            ("", ""),
        ],
        "status": [
            ("", ""),
            ("─── État du système ──────────────────────────────────────────", "muted"),
            ("CPU          ████████░░  78%   NORMAL", "green"),
            ("Mémoire      ██████░░░░  61%   NORMAL", "green"),
            ("Réseau       ██████████ 100%   EXCELLENT", "green"),
            ("Satellite    ██████████ 100%   CONNECTÉ", "green"),
            ("─── Fermes connectées ───────────────────────────────────────", "muted"),
            ("Ferme Nord   📍 Yaoundé      EN LIGNE    12 capteurs", "white"),
            ("Ferme Est    📍 Bertoua      EN LIGNE     8 capteurs", "white"),
            ("Ferme Ouest  📍 Bafoussam    EN LIGNE    27 capteurs", "white"),
            ("", ""),
            ("[✓] Tous les systèmes opérationnels", "green"),
            ("", ""),
        ],
        "meteo": [
            ("", ""),
            ("─── Météo Agricole — Région Centre ──────────────────────────", "muted"),
            ("", ""),
            ("Aujourd'hui     ⛅  26°C   Partiellement nuageux", "white"),
            ("Humidité        💧  74%    Favorable aux cultures", "blue"),
            ("Vent            🌬  12 km/h SO — modéré", "dim"),
            ("Pluie prévue    🌧  35%    Faible risque", "dim"),
            ("", ""),
            ("─── Prévisions 5 jours ──────────────────────────────────────", "muted"),
            ("Mer 29/04   ⛅  28°C  Ensoleillé         Idéal semis", "green"),
            ("Jeu 30/04   🌧  24°C  Averses modérées   Report conseillé", "yellow"),
            ("Ven 01/05   ⛅  27°C  Partiellement ☁    Bon pour épandage", "green"),
            ("Sam 02/05   ☀️   30°C  Soleil              Irrigation requise", "yellow"),
            ("Dim 03/05   ☀️   29°C  Soleil              Irrigation requise", "yellow"),
            ("", ""),
            ("[!] Alerte : stress hydrique possible vendredi—samedi.", "yellow"),
            ("", ""),
        ],
        "cultures": [
            ("", ""),
            ("─── Cultures Recommandées — Saison actuelle ─────────────────", "muted"),
            ("", ""),
            ("🌽  Maïs           Rendement estimé : 4.2 t/ha   ★★★★★", "green"),
            ("🍅  Tomate         Rendement estimé : 28 t/ha    ★★★★☆", "green"),
            ("🥜  Arachide       Rendement estimé : 1.8 t/ha   ★★★★☆", "green"),
            ("🍠  Manioc         Rendement estimé : 18 t/ha    ★★★★★", "green"),
            ("🌿  Soja           Rendement estimé : 2.1 t/ha   ★★★☆☆", "yellow"),
            ("🌾  Riz paddy      Rendement estimé : 3.5 t/ha   ★★★★☆", "green"),
            ("🧅  Oignon         Rendement estimé : 22 t/ha    ★★★☆☆", "yellow"),
            ("", ""),
            ("Base : 35 247 variétés indexées. Données : 28/04/2026.", "dim"),
            ("", ""),
        ],
        "sol": [
            ("", ""),
            ("─── Analyse de Sol — Ferme Principale ──────────────────────", "muted"),
            ("", ""),
            ("pH               6.4    ✓ Légèrement acide — optimal", "green"),
            ("Azote (N)        42 mg/kg  ⚠ Faible — apport recommandé", "yellow"),
            ("Phosphore (P)    68 mg/kg  ✓ Bon niveau", "green"),
            ("Potassium (K)    210 mg/kg ✓ Excellent", "green"),
            ("Matière org.     3.2%      ✓ Correct", "green"),
            ("Humidité sol     41%       ✓ Bon pour semis", "green"),
            ("Texture          Argilo-limoneuse", "white"),
            ("", ""),
            ("Recommandation :", "blue"),
            ("  → Apport d'urée (60 kg/ha) avant la prochaine pluie.", "white"),
            ("  → Sol adapté pour maïs, tomate, manioc.", "white"),
            ("", ""),
        ],
        "alerte": [
            ("", ""),
            ("─── Alertes Phytosanitaires Actives ─────────────────────────", "muted"),
            ("", ""),
            ("[⚠] MODÉRÉ   Chenille légionnaire — Zone Nord (3 km)", "yellow"),
            ("             Traitement préventif conseillé sous 72h", "dim"),
            ("", ""),
            ("[⚠] FAIBLE   Mildiou sur tomate — Conditions favorables", "yellow"),
            ("             Surveiller l'humidité foliaire", "dim"),
            ("", ""),
            ("[✓] Aucune alerte critique en ce moment.", "green"),
            ("", ""),
            ("Dernière analyse IA : il y a 18 minutes.", "dim"),
            ("", ""),
        ],
        "recolte": [
            ("", ""),
            ("─── Prévisions de Récolte — Saison 2026 ────────────────────", "muted"),
            ("", ""),
            ("Culture      Parcelle    Date prévue    Rendement    Confiance", "blue"),
            ("─────────────────────────────────────────────────────────────", "muted"),
            ("Maïs         A-12        15 Juin 2026   4.2 t/ha     92%", "green"),
            ("Tomate       B-03        08 Mai  2026   27 t/ha      88%", "green"),
            ("Manioc       C-07        Oct.    2026   18 t/ha      85%", "green"),
            ("Arachide     D-01        20 Juil 2026   1.7 t/ha     79%", "yellow"),
            ("", ""),
            ("Revenus projetés : 3 420 000 FCFA  (+12% vs saison précédente)", "white"),
            ("", ""),
        ],
        "capteurs": [
            ("", ""),
            ("─── État des Capteurs Terrain ───────────────────────────────", "muted"),
            ("", ""),
            ("ID       Type              Batterie   Signal   Statut", "blue"),
            ("─────────────────────────────────────────────────────────────", "muted"),
            ("S-001    Humidité sol      █████ 94%  ████ 87%   EN LIGNE", "green"),
            ("S-002    Température       ████░ 78%  █████100%  EN LIGNE", "green"),
            ("S-003    NPK sol           ██░░░ 42%  ████  91%  EN LIGNE", "yellow"),
            ("S-004    Pluviomètre       █████ 88%  ████  83%  EN LIGNE", "green"),
            ("S-005    CO₂ atmosphérique ███░░ 61%  ███░  72%  EN LIGNE", "green"),
            ("S-006    Caméra IA         ░░░░░  8%  ████  95%  BATTERIE FAIBLE", "red"),
            ("S-007    Lux/UV            █████ 99%  █████ 98%  EN LIGNE", "green"),
            ("", ""),
            ("[!] S-006 : Remplacer la batterie dans les 24h.", "red"),
            ("", ""),
        ],
        "date": [
            ("", ""),
            (datetime.datetime.now().strftime("%A %d %B %Y — %H:%M:%S"), "green"),
            ("", ""),
        ],
    }

LOAD_STEPS = [
    (8,   "Vérification des capteurs terrain..."),
    (20,  "Chargement des bases de données agricoles..."),
    (35,  "Connexion aux satellites météo..."),
    (50,  "Initialisation du moteur IA..."),
    (65,  "Calibration des modèles de prédiction..."),
    (78,  "Chargement des données de sol..."),
    (90,  "Synchronisation des fermes connectées..."),
    (100, "Système prêt !"),
]

BOOT_LINES = [
    ("╔══════════════════════════════════════════════════════════╗", "muted"),
    ("║       🌱  AGRISMART AGRICULTURAL INTELLIGENCE           ║", "green"),
    ("║              Système CLI — Version 3.1.0               ║", "dim"),
    ("╚══════════════════════════════════════════════════════════╝", "muted"),
    ("", ""),
    ("[✓] Moteur IA agricole         opérationnel", "green"),
    ("[✓] Capteurs terrain           connectés (47 actifs)", "green"),
    ("[✓] Données météorologiques    temps réel", "green"),
    ("[✓] Base cultures              35 000+ variétés chargées", "green"),
    ("[✓] Analyses de sol            disponibles", "green"),
    ("", ""),
    ('Bienvenue dans AgriSmart — Tapez "help" pour commencer.', "blue"),
    ("", ""),
]


# ── Application principale ────────────────────────────────────────────
class AgriSmartApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("AgriSmart CLI — v3.1.0")
        self.root.configure(bg=BG_DARK)
        self.root.geometry("920x620")
        self.root.minsize(700, 480)

        self.cmd_history = []
        self.hist_idx    = -1
        self.exited      = False

        self._build_ui()
        self._run_loader()
        self.root.mainloop()

    # ── Construction UI ───────────────────────────────────────────────
    def _build_ui(self):
        mono = ("Courier New", 11)

        # ── Barre de titre personnalisée ──────────────────────────────
        titlebar = tk.Frame(self.root, bg=BG_BAR, height=38)
        titlebar.pack(fill="x", side="top")
        titlebar.pack_propagate(False)

        # Dots macOS style
        dots_frame = tk.Frame(titlebar, bg=BG_BAR)
        dots_frame.pack(side="left", padx=12, pady=10)
        for color in ("#ff5f57", "#ffbd2e", "#28c840"):
            c = tk.Canvas(dots_frame, width=13, height=13, bg=BG_BAR, highlightthickness=0)
            c.pack(side="left", padx=3)
            c.create_oval(1, 1, 12, 12, fill=color, outline="")

        tk.Label(titlebar, text="AGRISMART CLI — v3.1.0  |  bash — 80×24",
                 bg=BG_BAR, fg=DIM, font=("Courier New", 9)).pack(side="left", padx=20)

        # Bouton fermer
        tk.Button(titlebar, text="✕", bg=BG_BAR, fg=DIM, relief="flat",
                  bd=0, font=("Courier New", 11), cursor="hand2",
                  activebackground="#ff5f57", activeforeground="white",
                  command=self.root.destroy).pack(side="right", padx=10)

        # Rendre la fenêtre draggable via titlebar
        titlebar.bind("<ButtonPress-1>",   self._start_drag)
        titlebar.bind("<B1-Motion>",       self._do_drag)

        # ── Loader overlay ─────────────────────────────────────────────
        self.loader_frame = tk.Frame(self.root, bg=BG_DARK)
        self.loader_frame.place(relx=0, rely=0, relwidth=1, relheight=1)

        tk.Label(self.loader_frame, text="🌱", font=("Segoe UI Emoji", 36),
                 bg=BG_DARK, fg=GREEN).pack(pady=(120, 4))
        tk.Label(self.loader_frame, text="AGRISMART",
                 bg=BG_DARK, fg=GREEN, font=("Courier New", 20, "bold")).pack()
        tk.Label(self.loader_frame, text="Agricultural Intelligence System",
                 bg=BG_DARK, fg=DIM, font=("Courier New", 9)).pack(pady=(2, 30))

        # Barre de progression
        bar_container = tk.Frame(self.loader_frame, bg=BG_DARK)
        bar_container.pack()

        bar_bg = tk.Frame(bar_container, bg=MUTED, height=8, width=380)
        bar_bg.pack()
        bar_bg.pack_propagate(False)

        self.bar_fill = tk.Frame(bar_bg, bg=GREEN, height=8, width=0)
        self.bar_fill.place(x=0, y=0, height=8)

        meta = tk.Frame(bar_container, bg=BG_DARK)
        meta.pack(fill="x", pady=(6, 0))

        self.step_label = tk.Label(meta, text="Initialisation...",
                                   bg=BG_DARK, fg=DIM, font=("Courier New", 9))
        self.step_label.pack(side="left")
        self.pct_label = tk.Label(meta, text="0%",
                                  bg=BG_DARK, fg=GREEN, font=("Courier New", 9, "bold"))
        self.pct_label.pack(side="right")

        # ── Zone terminal ──────────────────────────────────────────────
        self.term_frame = tk.Frame(self.root, bg=BG)
        # (affiché après le loader)

        # Écran scrollable
        screen_frame = tk.Frame(self.term_frame, bg=BG)
        screen_frame.pack(fill="both", expand=True, padx=0, pady=0)

        scrollbar = tk.Scrollbar(screen_frame, bg=BG, troughcolor=BG, relief="flat", width=8)
        scrollbar.pack(side="right", fill="y")

        self.screen = tk.Text(
            screen_frame,
            bg=BG, fg=DEFAULT, insertbackground=GREEN,
            font=mono, state="disabled", wrap="word",
            relief="flat", bd=0, padx=16, pady=12,
            yscrollcommand=scrollbar.set, cursor="arrow",
        )
        self.screen.pack(side="left", fill="both", expand=True)
        scrollbar.config(command=self.screen.yview)

        # Tags couleur
        for tag, color in COLOR_MAP.items():
            self.screen.tag_config(tag, foreground=color)
        self.screen.tag_config("default", foreground=DEFAULT)
        self.screen.tag_config("dim",     foreground=DIM)

        # Séparateur
        tk.Frame(self.term_frame, bg=MUTED, height=1).pack(fill="x")

        # Ligne d'input
        input_row = tk.Frame(self.term_frame, bg=BG, pady=10)
        input_row.pack(fill="x", padx=16)

        tk.Label(input_row, text="agrismart", bg=BG, fg=GREEN,
                 font=mono).pack(side="left")
        tk.Label(input_row, text="@farm", bg=BG, fg=DIM,
                 font=mono).pack(side="left")
        tk.Label(input_row, text=":~$ ", bg=BG, fg=GREEN,
                 font=mono).pack(side="left")

        self.entry = tk.Entry(
            input_row,
            bg=BG, fg=WHITE, insertbackground=GREEN,
            font=mono, relief="flat", bd=0,
        )
        self.entry.pack(side="left", fill="x", expand=True)
        self.entry.bind("<Return>",   self._on_enter)
        self.entry.bind("<Up>",       self._hist_up)
        self.entry.bind("<Down>",     self._hist_down)

    # ── Drag fenêtre ──────────────────────────────────────────────────
    def _start_drag(self, e):
        self._dx = e.x
        self._dy = e.y

    def _do_drag(self, e):
        x = self.root.winfo_x() + e.x - self._dx
        y = self.root.winfo_y() + e.y - self._dy
        self.root.geometry(f"+{x}+{y}")

    # ── Loader ────────────────────────────────────────────────────────
    def _run_loader(self):
        def worker():
            for val, label in LOAD_STEPS:
                self.root.after(0, self._update_loader, val, label)
                time.sleep(0.25 + (0.15 * (1 - val / 100)))
            self.root.after(400, self._finish_loader)

        threading.Thread(target=worker, daemon=True).start()

    def _update_loader(self, val, label):
        self.bar_fill.place(x=0, y=0, height=8, width=int(380 * val / 100))
        self.step_label.config(text=label)
        self.pct_label.config(text=f"{val}%")

    def _finish_loader(self):
        self.loader_frame.place_forget()
        self.term_frame.pack(fill="both", expand=True)
        self._boot_sequence()

    # ── Boot ──────────────────────────────────────────────────────────
    def _boot_sequence(self):
        def step(i=0):
            if i >= len(BOOT_LINES):
                self.entry.focus_set()
                return
            text, cls = BOOT_LINES[i]
            self._print(text, cls)
            self.root.after(60, step, i + 1)

        self.root.after(50, step)

    # ── Affichage ─────────────────────────────────────────────────────
    def _print(self, text, cls=""):
        self.screen.config(state="normal")
        tag = cls if cls in COLOR_MAP or cls in ("dim",) else "default"
        self.screen.insert("end", text + "\n", tag)
        self.screen.config(state="disabled")
        self.screen.see("end")

    def _print_lines(self, lines):
        for text, cls in lines:
            self._print(text, cls)

    # ── Commandes ─────────────────────────────────────────────────────
    def _on_enter(self, event=None):
        if self.exited:
            return
        raw = self.entry.get().strip()
        self.entry.delete(0, "end")
        self._print(f"agrismart@farm:~$ {raw}", "dim")

        if not raw:
            return

        self.cmd_history.insert(0, raw)
        self.hist_idx = -1

        parts = raw.split(maxsplit=1)
        cmd   = parts[0].lower()
        args  = parts[1] if len(parts) > 1 else ""

        commands = get_commands()

        if cmd == "clear":
            self.screen.config(state="normal")
            self.screen.delete("1.0", "end")
            self.screen.config(state="disabled")
        elif cmd == "exit":
            self._print("", "")
            self._print("Déconnexion d'AgriSmart...", "yellow")
            self._print("[✓] Session sauvegardée. À bientôt !", "dim")
            self._print("", "")
            self.exited = True
            self.entry.config(state="disabled")
            self.root.after(2000, self.root.destroy)
        elif cmd == "echo":
            self._print("", "")
            self._print(args or "", "green")
            self._print("", "")
        elif cmd in commands:
            self._print_lines(commands[cmd])
        else:
            self._print("", "")
            self._print(f"bash: {cmd}: commande introuvable", "red")
            self._print('Tapez "help" pour voir les commandes disponibles.', "dim")
            self._print("", "")

    def _hist_up(self, event):
        if self.hist_idx < len(self.cmd_history) - 1:
            self.hist_idx += 1
            self.entry.delete(0, "end")
            self.entry.insert(0, self.cmd_history[self.hist_idx])

    def _hist_down(self, event):
        if self.hist_idx > 0:
            self.hist_idx -= 1
            self.entry.delete(0, "end")
            self.entry.insert(0, self.cmd_history[self.hist_idx])
        else:
            self.hist_idx = -1
            self.entry.delete(0, "end")


# ── Lancement ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    AgriSmartApp()
