from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.actionneur import Actionneur
from app.models.action     import Action
from app.models.user       import User, RoleEnum
from app.schemas.capteur   import ActionneurCreate, ActionneurOut, ActionCreate, ActionOut
 
router = APIRouter(prefix="/actionneurs", tags=["Actionneurs"])
 
 
@router.post("/", response_model=ActionneurOut, status_code=201)
def creer_actionneur(payload: ActionneurCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    actionneur = Actionneur(**payload.model_dump())
    db.add(actionneur)
    db.commit()
    db.refresh(actionneur)
    return actionneur
 
 
@router.get("/", response_model=List[ActionneurOut])
def lister_actionneurs(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Actionneur).all()
 
 
@router.post("/actions", response_model=ActionOut, status_code=201)
def declencher_action(
    payload: ActionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == RoleEnum.consultation:
        raise HTTPException(status_code=403, detail="Rôle insuffisant pour commander un actionneur")
    actionneur = db.query(Actionneur).filter(Actionneur.id == payload.id_actionneur).first()
    if not actionneur:
        raise HTTPException(status_code=404, detail="Actionneur introuvable")
    action = Action(**payload.model_dump(), id_user=current_user.id)
    # Mettre à jour le statut de l'actionneur
    actionneur.statut = payload.commande == "ON"
    db.add(action)
    db.commit()
    db.refresh(action)
    return action
 
 
@router.get("/actions", response_model=List[ActionOut])
def historique_actions(limit: int = 50, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Action).order_by(Action.date_heure.desc()).limit(limit).all()
