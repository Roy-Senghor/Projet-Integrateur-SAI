from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base
 
 
class SeuilConfig(Base):
    __tablename__ = "seuils_config"
 
    id          = Column(Integer, primary_key=True, index=True)
    type_mesure = Column(String(50), unique=True, nullable=False, index=True)
    valeur_min  = Column(Float, nullable=True)
    valeur_max  = Column(Float, nullable=True)
    unite       = Column(String(20), nullable=True)
    actif       = Column(Boolean, default=True)
    updated_at  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())