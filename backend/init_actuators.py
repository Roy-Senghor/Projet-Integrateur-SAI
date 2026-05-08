from app.core.database import SessionLocal
from app.models.action import Action
from datetime import datetime

def init_actuators():
    """Initialise tous les actionneurs dans la base de données"""
    db = SessionLocal()
    try:
        actuators = [
            {"actionneur": "pompe", "commande": False},
            {"actionneur": "ventilateur", "commande": False},
            {"actionneur": "lampe", "commande": False},
        ]
        
        for act_data in actuators:
            # Check if already exists
            existing = db.query(Action).filter(
                Action.actionneur == act_data["actionneur"]
            ).first()
            
            if not existing:
                action = Action(
                    actionneur=act_data["actionneur"],
                    commande=act_data["commande"],
                    timestamp=datetime.now(),
                    user_id=None  # System init
                )
                db.add(action)
                print(f"✅ Actionneur {act_data['actionneur']} initialisé")
            else:
                print(f"ℹ️  Actionneur {act_data['actionneur']} existe déjà")
        
        db.commit()
        print("\n🎉 Initialisation terminée!")
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_actuators()
