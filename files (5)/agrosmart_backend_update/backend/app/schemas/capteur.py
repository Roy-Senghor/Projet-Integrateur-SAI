from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.action import SourceEnum


class MesureCreate(BaseModel):
    capteur: str
    type_mesure: str
    valeur: float
    unite: Optional[str] = None


class MesureOut(MesureCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class ActionCreate(BaseModel):
    actionneur: str
    commande: bool
    source: SourceEnum = SourceEnum.manuel


class ActionOut(ActionCreate):
    id: int
    user_id: Optional[int]
    timestamp: datetime

    class Config:
        from_attributes = True


class AlerteOut(BaseModel):
    id: int
    type_mesure: str
    valeur: float
    seuil: float
    message: str
    resolue: Optional[bool] = False
    timestamp: datetime

    class Config:
        from_attributes = True


# --- Seuils ---
class SeuilOut(BaseModel):
    id: int
    type_mesure: str
    valeur_min: Optional[float] = None
    valeur_max: Optional[float] = None
    unite: Optional[str] = None
    actif: Optional[bool] = True
    updated_at: datetime

    class Config:
        from_attributes = True


class SeuilUpdate(BaseModel):
    valeur_min: Optional[float] = None
    valeur_max: Optional[float] = None
    unite: Optional[str] = None
    actif: Optional[bool] = None
