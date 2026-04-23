from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.mesure  import Mesure
from app.models.capteur import Capteur
from app.models.seuil   import Seuil
from app.models.alerte  import Alerte, NiveauEnum
from app.schemas.capteur import MesureCreate, MesureOut
 
router = APIRouter(prefix="/mesures", tags=["Mesures"])
 
 
@router.post("/", response_model=MesureOut, status_code=201)
def ajouter_mesure(payload: MesureCreate, db: Session = Depends(get_db)):
    """Appelé par l'ESP32 pour envoyer une mesure."""
    mesure = Mesure(**payload.model_dump())
    db.add(mesure)
 
    # Vérification automatique des seuils → alerte si dépassement
    seuil = db.query(Seuil).filter(Seuil.id_capteur == payload.id_capteur).first()
    if seuil:
        alerte_msg = None
        niveau = NiveauEnum.warning
        if seuil.valeur_min is not None and payload.valeur < seuil.valeur_min:
            alerte_msg = f"Valeur {payload.valeur} en dessous du seuil min {seuil.valeur_min}"
            niveau = NiveauEnum.critique
        elif seuil.valeur_max is not None and payload.valeur > seuil.valeur_max:
            alerte_msg = f"Valeur {payload.valeur} au dessus du seuil max {seuil.valeur_max}"
            niveau = NiveauEnum.warning
        if alerte_msg:
            db.add(Alerte(
                message=alerte_msg,
                niveau=niveau,
                id_capteur=payload.id_capteur,
                id_seuil=seuil.id,
            ))
 
    db.commit()
    db.refresh(mesure)
    return mesure
 
 
@router.get("/", response_model=List[MesureOut])
def lister_mesures(
    id_capteur: Optional[int] = Query(None),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Mesure)
    if id_capteur:
        q = q.filter(Mesure.id_capteur == id_capteur)
    return q.order_by(Mesure.horodatage.desc()).limit(limit).all()
 
 
@router.get("/dernieres", response_model=List[MesureOut])
def dernieres_mesures(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Dernière mesure par capteur — pour le dashboard temps réel."""
    from sqlalchemy import func
    subq = (
        db.query(Mesure.id_capteur, func.max(Mesure.horodatage).label("max_ts"))
        .group_by(Mesure.id_capteur)
        .subquery()
    )
    return (
        db.query(Mesure)
        .join(subq, (Mesure.id_capteur == subq.c.id_capteur) & (Mesure.horodatage == subq.c.max_ts))
        .all()
    )