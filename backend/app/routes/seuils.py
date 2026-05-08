from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.seuil_config import SeuilConfig
from app.models.user import User, RoleEnum

router = APIRouter(prefix="/seuils", tags=["Seuils"])


class SeuilCreate(BaseModel):
    type_mesure: str
    valeur_min: float | None = None
    valeur_max: float | None = None
    unite: str | None = None
    actif: bool = True


class SeuilUpdate(BaseModel):
    valeur_min: float | None = None
    valeur_max: float | None = None
    actif: bool | None = None


class SeuilOut(BaseModel):
    id: int
    type_mesure: str
    valeur_min: float | None
    valeur_max: float | None
    unite: str | None
    actif: bool

    class Config:
        from_attributes = True


@router.get("/", response_model=List[SeuilOut])
def lister_seuils(db: Session = Depends(get_db), _user=Depends(get_current_user)):
    """Retourne tous les seuils configurés"""
    return db.query(SeuilConfig).all()


@router.post("/", response_model=SeuilOut, status_code=201)
def creer_seuil(
    payload: SeuilCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == RoleEnum.consultation:
        raise HTTPException(status_code=403, detail="Rôle insuffisant")
    
    # Check if threshold already exists
    existing = db.query(SeuilConfig).filter(SeuilConfig.type_mesure == payload.type_mesure).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ce seuil existe déjà")
    
    seuil = SeuilConfig(**payload.model_dump())
    db.add(seuil)
    db.commit()
    db.refresh(seuil)
    return seuil


@router.put("/{type_mesure}", response_model=SeuilOut)
def mettre_a_jour_seuil(
    type_mesure: str,
    payload: SeuilUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == RoleEnum.consultation:
        raise HTTPException(status_code=403, detail="Rôle insuffisant")
    
    seuil = db.query(SeuilConfig).filter(SeuilConfig.type_mesure == type_mesure).first()
    if not seuil:
        raise HTTPException(status_code=404, detail="Seuil non trouvé")
    
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(seuil, field, value)
    
    db.commit()
    db.refresh(seuil)
    return seuil


@router.delete("/{type_mesure}")
def supprimer_seuil(
    type_mesure: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == RoleEnum.consultation:
        raise HTTPException(status_code=403, detail="Rôle insuffisant")
    
    seuil = db.query(SeuilConfig).filter(SeuilConfig.type_mesure == type_mesure).first()
    if not seuil:
        raise HTTPException(status_code=404, detail="Seuil non trouvé")
    
    db.delete(seuil)
    db.commit()
    return {"message": "Seuil supprimé"}
