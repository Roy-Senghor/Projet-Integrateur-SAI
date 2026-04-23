from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.seuil import Seuil
from app.models.user  import User, RoleEnum
from app.schemas.capteur import SeuilCreate, SeuilOut
 
router = APIRouter(prefix="/seuils", tags=["Seuils"])
 
 
@router.post("/", response_model=SeuilOut, status_code=201)
def creer_seuil(
    payload: SeuilCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == RoleEnum.consultation:
        raise HTTPException(status_code=403, detail="Rôle insuffisant")
    seuil = Seuil(**payload.model_dump(), id_user=current_user.id)
    db.add(seuil)
    db.commit()
    db.refresh(seuil)
    return seuil
 
 
@router.get("/", response_model=List[SeuilOut])
def lister_seuils(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Seuil).all()
 
 
@router.put("/{id}", response_model=SeuilOut)
def modifier_seuil(
    id: int,
    payload: SeuilCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    seuil = db.query(Seuil).filter(Seuil.id == id).first()
    if not seuil:
        raise HTTPException(status_code=404, detail="Seuil introuvable")
    if current_user.role == RoleEnum.consultation:
        raise HTTPException(status_code=403, detail="Rôle insuffisant")
    seuil.valeur_min = payload.valeur_min
    seuil.valeur_max = payload.valeur_max
    seuil.id_user = current_user.id
    db.commit()
    db.refresh(seuil)
    return seuil