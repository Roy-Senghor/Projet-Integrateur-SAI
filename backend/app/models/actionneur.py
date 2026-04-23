from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
 
 
class TypeActionneurEnum(str, enum.Enum):
    pompe       = "pompe"
    ventilateur = "ventilateur"
    led         = "led"
 
 
class Actionneur(Base):
    __tablename__ = "actionneurs"
 
    id     = Column(Integer, primary_key=True, index=True)
    nom    = Column(String(50), nullable=False)
    type   = Column(Enum(TypeActionneurEnum), nullable=False)
    statut = Column(Boolean, default=False)
 
    actions = relationship("Action", back_populates="actionneur")