from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.seuil_config import SeuilConfig
from app.schemas.capteur import SeuilOut, SeuilUpdate

router = APIRouter(prefix="/seuils", tags=["Seuils"])


@router.get("/", response_model=List[SeuilOut])
def lister_seuils(db: Session = Depends(get_db), _user=Depends(get_current_user)):
    return db.query(SeuilConfig).all()


@router.patch("/{type_mesure}", response_model=SeuilOut)
def modifier_seuil(
    type_mesure: str,
    payload: SeuilUpdate,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    seuil = db.query(SeuilConfig).filter(SeuilConfig.type_mesure == type_mesure).first()
    if not seuil:
        raise HTTPException(status_code=404, detail="Seuil introuvable")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(seuil, field, value)
    db.commit()
    db.refresh(seuil)
    return seuil
