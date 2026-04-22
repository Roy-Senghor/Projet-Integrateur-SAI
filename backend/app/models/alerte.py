from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base
 
 
class Alerte(Base):
    __tablename__ = "alertes"
 
    id          = Column(Integer, primary_key=True, index=True)
    type_mesure = Column(String(50), nullable=False)
    valeur      = Column(Float, nullable=False)
    seuil       = Column(Float, nullable=False)
    message     = Column(String(255), nullable=False)
    resolue     = Column(Boolean, default=False)
    timestamp   = Column(DateTime(timezone=True), server_default=func.now(), index=True)