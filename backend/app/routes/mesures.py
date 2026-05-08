from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.mesure import Mesure
from app.models.alerte import Alerte
from app.schemas.capteur import MesureCreate, MesureOut
 
router = APIRouter(prefix="/mesures", tags=["Mesures capteurs"])
 
SEUILS = {
    "humidite_sol": {"min": 20.0,  "max": 90.0,   "unite": "%"},
    "temperature":  {"min": 10.0,  "max": 40.0,   "unite": "°C"},
    "humidite_air": {"min": 30.0,  "max": 85.0,   "unite": "%"},
    "co2":          {"min": None,  "max": 1500.0,  "unite": "ppm"},
    "luminosite":   {"min": 200.0, "max": None,    "unite": "lux"},
    "niveau_eau":   {"min": 10.0,  "max": None,    "unite": "%"},
}
 
 
@router.post("/", response_model=MesureOut, status_code=201)
def ajouter_mesure(payload: MesureCreate, db: Session = Depends(get_db)):
    mesure = Mesure(**payload.model_dump())
    db.add(mesure)
    seuil = SEUILS.get(payload.type_mesure)
    if seuil:
        alerte_msg = None
        if seuil["min"] and payload.valeur < seuil["min"]:
            alerte_msg = f"{payload.type_mesure} trop basse : {payload.valeur}{seuil['unite']} (min: {seuil['min']})"
        elif seuil["max"] and payload.valeur > seuil["max"]:
            alerte_msg = f"{payload.type_mesure} trop haute : {payload.valeur}{seuil['unite']} (max: {seuil['max']})"
        if alerte_msg:
            db.add(Alerte(
                type_mesure=payload.type_mesure,
                valeur=payload.valeur,
                seuil=seuil["min"] if (seuil["min"] and payload.valeur < seuil["min"]) else seuil["max"],
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


@router.get("/historique/{hours}")
def get_historical_data(
    hours: int,
    type_mesure: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    """Récupère les données historiques pour les N dernières heures"""
    since = datetime.utcnow() - timedelta(hours=hours)
    
    q = db.query(Mesure).filter(Mesure.timestamp >= since)
    if type_mesure:
        q = q.filter(Mesure.type_mesure == type_mesure)
    
    mesures = q.order_by(Mesure.timestamp.asc()).all()
    
    # Grouper par heure pour les graphiques
    result = {}
    for mesure in mesures:
        hour_key = mesure.timestamp.strftime('%H:00')
        if mesure.type_mesure not in result:
            result[mesure.type_mesure] = {}
        if hour_key not in result[mesure.type_mesure]:
            result[mesure.type_mesure][hour_key] = []
        result[mesure.type_mesure][hour_key].append(mesure.valeur)
    
    # Calculer la moyenne par heure
    averaged_data = {}
    for sensor_type, hourly_data in result.items():
        averaged_data[sensor_type] = []
        for hour in range(hours):
            hour_key = f"{hour:02d}:00"
            values = hourly_data.get(hour_key, [])
            avg_value = sum(values) / len(values) if values else None
            averaged_data[sensor_type].append(avg_value)
    
    return averaged_data