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
    non_acquittees: bool = True,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Alerte)
    if non_acquittees:
        q = q.filter(Alerte.acquittee == False)
    return q.order_by(Alerte.date_heure.desc()).all()
 
 
@router.patch("/{id}/acquitter", response_model=AlerteOut)
def acquitter_alerte(id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    alerte = db.query(Alerte).filter(Alerte.id == id).first()
    if not alerte:
        raise HTTPException(status_code=404, detail="Alerte introuvable")
    alerte.acquittee = True
    db.commit()
    db.refresh(alerte)
    return alerte