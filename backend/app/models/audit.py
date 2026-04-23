from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
 
 
class Audit(Base):
    __tablename__ = "audit"
 
    id               = Column(Integer, primary_key=True, index=True)
    action           = Column(String(100), nullable=False)
    table_concernee  = Column(String(50), nullable=False)
    ancienne_valeur  = Column(Text, nullable=True)
    nouvelle_valeur  = Column(Text, nullable=True)
    date_heure       = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    adresse_ip       = Column(String(45), nullable=True)
    id_user          = Column(Integer, ForeignKey("users.id"), nullable=True)
 
    user = relationship("User", back_populates="audits")