from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base
 
 
class Mesure(Base):
    __tablename__ = "mesures"
 
    id          = Column(Integer, primary_key=True, index=True)
    capteur     = Column(String(50), nullable=False)
    type_mesure = Column(String(50), nullable=False)
    valeur      = Column(Float, nullable=False)
    unite       = Column(String(20), nullable=True)
    timestamp   = Column(DateTime(timezone=True), server_default=func.now(), index=True)