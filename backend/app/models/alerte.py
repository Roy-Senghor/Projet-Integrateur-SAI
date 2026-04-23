from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base
 
 
class NiveauEnum(str, enum.Enum):
    info     = "info"
    warning  = "warning"
    critique = "critique"
 
 
class Alerte(Base):
    __tablename__ = "alertes"
 
    id         = Column(Integer, primary_key=True, index=True)
    message    = Column(String(255), nullable=False)
    niveau     = Column(Enum(NiveauEnum), default=NiveauEnum.warning)
    date_heure = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    acquittee  = Column(Boolean, default=False)
    id_capteur = Column(Integer, ForeignKey("capteurs.id"), nullable=False)
    id_user    = Column(Integer, ForeignKey("users.id"), nullable=True)
    id_seuil   = Column(Integer, ForeignKey("seuils.id"), nullable=True)
 
    capteur = relationship("Capteur", back_populates="alertes")
    user    = relationship("User",    back_populates="alertes")
    seuil   = relationship("Seuil",   back_populates="alertes")