from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.action import Action
from app.models.user import User, RoleEnum
from app.schemas.capteur import ActionCreate, ActionOut
 
router = APIRouter(prefix="/actionneurs", tags=["Actionneurs"])
 
ACTIONNEURS_VALIDES = ["pompe", "ventilation", "eclairage"]
 
 
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
    action = Action(**payload.model_dump(), user_id=current_user.id)
    db.add(action)
    db.commit()
    db.refresh(action)
    return action
 
 
@router.get("/historique", response_model=List[ActionOut])
def historique_actions(limit: int = 50, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    return db.query(Action).order_by(Action.timestamp.desc()).limit(limit).all()