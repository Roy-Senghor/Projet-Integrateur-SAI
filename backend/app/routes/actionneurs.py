from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.action import Action
from app.models.user import User, RoleEnum
from app.schemas.capteur import ActionCreate, ActionOut
 
router = APIRouter(prefix="/actionneurs", tags=["Actionneurs"])
 
ACTIONNEURS_VALIDES = ["pompe", "ventilateur", "lampe"]
 
 
@router.post("/", response_model=ActionOut, status_code=201)
def declencher_actionneur(
    payload: ActionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == RoleEnum.consultation:
        raise HTTPException(status_code=403, detail="Rôle insuffisant")
    if payload.actionneur not in ACTIONNEURS_VALIDES:
        raise HTTPException(status_code=400, detail=f"Actionneur inconnu. Valeurs: {ACTIONNEURS_VALIDES}")
    
    # Publish MQTT command to trigger the physical actuator
    from app.main import mqtt
    topic = f"agri/commande/{payload.actionneur}"
    command_str = "ON" if payload.commande else "OFF"
    mqtt.client.publish(topic, command_str)
    print(f"[MQTT] 📤 Commande envoyée → {topic} : {command_str}")
    
    # Update local state immediately for responsive UI
    from app.core.mqtt_state import actuator_states
    from datetime import datetime
    actuator_states[payload.actionneur]["commande"] = payload.commande
    actuator_states[payload.actionneur]["timestamp"] = datetime.utcnow()
    
    action = Action(**payload.model_dump(), user_id=current_user.id)
    db.add(action)
    db.commit()
    db.refresh(action)
    return action
 
 
@router.get("/", response_model=List[ActionOut])
def lister_actionneurs(db: Session = Depends(get_db), _user=Depends(get_current_user)):
    """Retourne l'état actuel de tous les actionneurs depuis MQTT"""
    from datetime import datetime
    from app.models.action import SourceEnum
    from app.core.mqtt_state import actuator_states
    
    # Return actuators with real-time MQTT state
    actions = []
    for idx, actionneur in enumerate(ACTIONNEURS_VALIDES):
        state = actuator_states.get(actionneur, {"commande": False, "timestamp": None})
        actions.append({
            "id": idx + 1,
            "actionneur": actionneur,
            "commande": state["commande"],
            "source": SourceEnum.manuel,
            "user_id": None,
            "timestamp": state["timestamp"] or datetime.now()
        })
    
    return actions


@router.get("/historique", response_model=List[ActionOut])
def historique_actions(limit: int = 50, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    return db.query(Action).order_by(Action.timestamp.desc()).limit(limit).all()