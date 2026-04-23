from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
 
 
class Seuil(Base):
    __tablename__ = "seuils"
 
    id                = Column(Integer, primary_key=True, index=True)
    valeur_min        = Column(Float, nullable=True)
    valeur_max        = Column(Float, nullable=True)
    date_modification = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    id_capteur        = Column(Integer, ForeignKey("capteurs.id"), nullable=False)
    id_user           = Column(Integer, ForeignKey("users.id"), nullable=True)
 
    capteur = relationship("Capteur", back_populates="seuils")
    user    = relationship("User",    back_populates="seuils")
    alertes = relationship("Alerte",  back_populates="seuil")