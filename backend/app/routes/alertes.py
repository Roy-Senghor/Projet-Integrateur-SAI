from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.alerte import Alerte
from app.schemas.capteur import AlerteOut
 
router = APIRouter(prefix="/alertes", tags=["Alertes"])
 
 
@router.get("/", response_model=List[AlerteOut])
def lister_alertes(
    non_resolues: bool = True,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    q = db.query(Alerte)
    if non_resolues:
        q = q.filter(Alerte.resolue == False)
    return q.order_by(Alerte.timestamp.desc()).all()
 
 
@router.patch("/{alerte_id}/resoudre", response_model=AlerteOut)
def resoudre_alerte(alerte_id: int, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    alerte = db.query(Alerte).filter(Alerte.id == alerte_id).first()
    if not alerte:
        raise HTTPException(status_code=404, detail="Alerte introuvable")
    alerte.resolue = True
    db.commit()
    db.refresh(alerte)
    return alerte