from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
 
 
class Mesure(Base):
    __tablename__ = "mesures"
 
    id          = Column(Integer, primary_key=True, index=True)
    valeur      = Column(Float, nullable=False)
    horodatage  = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    id_capteur  = Column(Integer, ForeignKey("capteurs.id"), nullable=False)
 
    capteur = relationship("Capteur", back_populates="mesures")