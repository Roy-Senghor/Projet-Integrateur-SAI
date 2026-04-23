from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
 
 
class TypeCapteurEnum(str, enum.Enum):
    humidite_sol = "humidite_sol"
    temperature  = "temperature"
    luminosite   = "luminosite"
    co2          = "co2"
    niveau_eau   = "niveau_eau"
 
 
class Capteur(Base):
    __tablename__ = "capteurs"
 
    id           = Column(Integer, primary_key=True, index=True)
    nom          = Column(String(50), nullable=False)
    type         = Column(Enum(TypeCapteurEnum), nullable=False)
    unite_mesure = Column(String(20), nullable=True)
    statut       = Column(Boolean, default=True)
 
    mesures = relationship("Mesure", back_populates="capteur")
    alertes = relationship("Alerte", back_populates="capteur")
    seuils  = relationship("Seuil",  back_populates="capteur")