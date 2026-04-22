from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base
 
 
class RoleEnum(str, enum.Enum):
    consultation = "consultation"
    modification = "modification"
    admin = "admin"
 
 
class User(Base):
    __tablename__ = "users"
 
    id         = Column(Integer, primary_key=True, index=True)
    nom        = Column(String(100), nullable=False)
    email      = Column(String(150), unique=True, index=True, nullable=False)
    password   = Column(String(255), nullable=False)
    role       = Column(Enum(RoleEnum), default=RoleEnum.consultation, nullable=False)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
 
    actions = relationship("Action", back_populates="user")