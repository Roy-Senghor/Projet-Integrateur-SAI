from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.models.mesure import Mesure
from app.models.alerte import Alerte
from app.models.seuil_config import SeuilConfig

# Track last save time for each sensor type
last_save_times = {}
SAVE_INTERVAL = timedelta(minutes=10)  # 10 minutes

def get_seuils():
    """Load thresholds from database"""
    db = SessionLocal()
    try:
        seuils = db.query(SeuilConfig).filter(SeuilConfig.actif == True).all()
        seuil_dict = {}
        for s in seuils:
            seuil_dict[s.type_mesure] = {"min": s.valeur_min, "max": s.valeur_max}
        return seuil_dict
    except Exception as e:
        print(f"[DB] ❌ Erreur chargement seuils: {e}")
        # Fallback to hardcoded thresholds
        return {
            "humidite_sol": {"min": 20.0,  "max": 90.0},
            "temperature":  {"min": 10.0,  "max": 40.0},
            "humidite_air": {"min": 30.0,  "max": 85.0},
            "luminosite":   {"min": 20.0,  "max": None},
            "gaz":          {"min": None,  "max": 500.0},
        }
    finally:
        db.close()

def add_to_buffer(capteur, type_mesure, valeur, unite):
    """Sauvegarde immédiatement si 10 minutes se sont écoulées depuis la dernière sauvegarde pour ce type"""
    now = datetime.now()
    last_save = last_save_times.get(type_mesure)
    
    # Check if 10 minutes have passed since last save for this sensor type
    if last_save is None or (now - last_save) >= SAVE_INTERVAL:
        db = SessionLocal()
        try:
            mesure = Mesure(
                capteur=capteur,
                type_mesure=type_mesure,
                valeur=valeur,
                unite=unite,
            )
            db.add(mesure)
            
            # Check thresholds for alerts
            SEUILS = get_seuils()
            seuil = SEUILS.get(type_mesure)
            if seuil:
                alerte_msg = None
                if seuil["min"] and valeur < seuil["min"]:
                    alerte_msg = f"{type_mesure} trop basse : {valeur}{unite} (min: {seuil['min']})"
                elif seuil["max"] and valeur > seuil["max"]:
                    alerte_msg = f"{type_mesure} trop haute : {valeur}{unite} (max: {seuil['max']})"
                
                if alerte_msg:
                    db.add(Alerte(
                        type_mesure=type_mesure,
                        valeur=valeur,
                        seuil=seuil["min"] if (seuil["min"] and valeur < seuil["min"]) else seuil["max"],
                        message=alerte_msg,
                    ))
                    print(f"[ALERTE] ⚠️  {alerte_msg}")
            
            db.commit()
            last_save_times[type_mesure] = now
            print(f"[DB] ✅ Sauvegardé {type_mesure} : {valeur} {unite}")
        except Exception as e:
            db.rollback()
            print(f"[DB] ❌ Erreur sauvegarde : {e}")
        finally:
            db.close()
    else:
        # Skip saving, not enough time has passed
        time_since_last = now - last_save
        remaining = SAVE_INTERVAL - time_since_last
        print(f"[DB] ⏭️  {type_mesure} ignoré (prochaine sauvegarde dans {int(remaining.total_seconds())}s)")
