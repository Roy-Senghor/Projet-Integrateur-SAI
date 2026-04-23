from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base
 
 
class RoleEnum(str, enum.Enum):
    admin        = "admin"
    operateur    = "operateur"
    consultation = "consultation"
 
 
class User(Base):
    __tablename__ = "users"
 
    id             = Column(Integer, primary_key=True, index=True)
    nom            = Column(String(50), nullable=False)
    prenom         = Column(String(50), nullable=False)
    email          = Column(String(100), unique=True, index=True, nullable=False)
    mot_de_passe   = Column(String(255), nullable=False)
    role           = Column(Enum(RoleEnum), default=RoleEnum.consultation, nullable=False)
    date_creation  = Column(DateTime(timezone=True), server_default=func.now())
 
    actions  = relationship("Action",    back_populates="user")
    alertes  = relationship("Alerte",    back_populates="user")
    seuils   = relationship("Seuil",     back_populates="user")
    audits   = relationship("Audit",     back_populates="user")