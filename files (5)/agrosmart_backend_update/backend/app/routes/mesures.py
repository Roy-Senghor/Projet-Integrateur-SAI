from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.mesure import Mesure
from app.models.alerte import Alerte
from app.models.seuil_config import SeuilConfig
from app.schemas.capteur import MesureCreate, MesureOut

router = APIRouter(prefix="/mesures", tags=["Mesures capteurs"])


def check_seuils_db(db: Session, type_mesure: str, valeur: float):
    """Vérifie les seuils depuis la BDD (au lieu du dict hardcodé)."""
    seuil = db.query(SeuilConfig).filter(
        SeuilConfig.type_mesure == type_mesure,
        SeuilConfig.actif == True
    ).first()
    if not seuil:
        return None
    alerte_msg = None
    seuil_val = None
    if seuil.valeur_min is not None and valeur < seuil.valeur_min:
        alerte_msg = f"{type_mesure} trop basse : {valeur}{seuil.unite or ''} (min: {seuil.valeur_min})"
        seuil_val = seuil.valeur_min
    elif seuil.valeur_max is not None and valeur > seuil.valeur_max:
        alerte_msg = f"{type_mesure} trop haute : {valeur}{seuil.unite or ''} (max: {seuil.valeur_max})"
        seuil_val = seuil.valeur_max
    return (alerte_msg, seuil_val) if alerte_msg else None


@router.post("/", response_model=MesureOut, status_code=201)
def ajouter_mesure(payload: MesureCreate, db: Session = Depends(get_db)):
    mesure = Mesure(**payload.model_dump())
    db.add(mesure)
    result = check_seuils_db(db, payload.type_mesure, payload.valeur)
    if result:
        alerte_msg, seuil_val = result
        db.add(Alerte(
            type_mesure=payload.type_mesure,
            valeur=payload.valeur,
            seuil=seuil_val,
            message=alerte_msg,
        ))
    db.commit()
    db.refresh(mesure)
    return mesure


@router.get("/", response_model=List[MesureOut])
def lister_mesures(
    type_mesure: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    q = db.query(Mesure)
    if type_mesure:
        q = q.filter(Mesure.type_mesure == type_mesure)
    return q.order_by(Mesure.timestamp.desc()).limit(limit).all()


@router.get("/derniere", response_model=List[MesureOut])
def derniere_mesure_par_capteur(db: Session = Depends(get_db), _user=Depends(get_current_user)):
    from sqlalchemy import func
    subq = (
        db.query(Mesure.type_mesure, func.max(Mesure.timestamp).label("max_ts"))
        .group_by(Mesure.type_mesure)
        .subquery()
    )
    return (
        db.query(Mesure)
        .join(subq, (Mesure.type_mesure == subq.c.type_mesure) & (Mesure.timestamp == subq.c.max_ts))
        .all()
    )
