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
    resolue: bool
    timestamp: datetime
 
    class Config:
        from_attributes = True