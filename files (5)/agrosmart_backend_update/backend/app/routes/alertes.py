from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.alerte import Alerte
from app.schemas.capteur import AlerteOut

router = APIRouter(prefix="/alertes", tags=["Alertes"])


@router.get("/", response_model=List[AlerteOut])
def lister_alertes(
    non_resolues: Optional[bool] = Query(None),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    q = db.query(Alerte)
    if non_resolues is True:
        q = q.filter(Alerte.resolue == False)
    elif non_resolues is False:
        q = q.filter(Alerte.resolue == True)
    return q.order_by(Alerte.timestamp.desc()).limit(limit).all()


@router.patch("/{alerte_id}/resoudre", response_model=AlerteOut)
def resoudre_alerte(alerte_id: int, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    alerte = db.query(Alerte).filter(Alerte.id == alerte_id).first()
    if not alerte:
        raise HTTPException(status_code=404, detail="Alerte introuvable")
    alerte.resolue = True
    db.commit()
    db.refresh(alerte)
    return alerte
