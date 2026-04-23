from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.capteur    import TypeCapteurEnum
from app.models.actionneur import TypeActionneurEnum
from app.models.action     import CommandeEnum, TypeDeclenchementEnum
from app.models.alerte     import NiveauEnum
 
 
class CapteurCreate(BaseModel):
    nom: str
    type: TypeCapteurEnum
    unite_mesure: Optional[str] = None
    statut: bool = True
 
 
class CapteurOut(CapteurCreate):
    id: int
    class Config:
        from_attributes = True
 
 
class MesureCreate(BaseModel):
    valeur: float
    id_capteur: int
 
 
class MesureOut(MesureCreate):
    id: int
    horodatage: datetime
    class Config:
        from_attributes = True
 
 
class ActionneurCreate(BaseModel):
    nom: str
    type: TypeActionneurEnum
    statut: bool = False
 
 
class ActionneurOut(ActionneurCreate):
    id: int
    class Config:
        from_attributes = True
 
 
class ActionCreate(BaseModel):
    commande: CommandeEnum
    type_declenchement: TypeDeclenchementEnum = TypeDeclenchementEnum.manuel
    id_actionneur: int
 
 
class ActionOut(ActionCreate):
    id: int
    id_user: Optional[int]
    date_heure: datetime
    class Config:
        from_attributes = True
 
 
class SeuilCreate(BaseModel):
    valeur_min: Optional[float] = None
    valeur_max: Optional[float] = None
    id_capteur: int
 
 
class SeuilOut(SeuilCreate):
    id: int
    date_modification: datetime
    id_user: Optional[int]
    class Config:
        from_attributes = True
 
 
class AlerteOut(BaseModel):
    id: int
    message: str
    niveau: NiveauEnum
    date_heure: datetime
    acquittee: bool
    id_capteur: int
    id_user: Optional[int]
    id_seuil: Optional[int]
    class Config:
        from_attributes = True