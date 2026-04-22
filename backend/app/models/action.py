from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base
 
 
class SourceEnum(str, enum.Enum):
    manuel      = "manuel"
    automatique = "automatique"
 
 
class Action(Base):
    __tablename__ = "actions"
 
    id         = Column(Integer, primary_key=True, index=True)
    actionneur = Column(String(50), nullable=False)
    commande   = Column(Boolean, nullable=False)
    source     = Column(Enum(SourceEnum), default=SourceEnum.manuel)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp  = Column(DateTime(timezone=True), server_default=func.now(), index=True)
 
    user = relationship("User", back_populates="actions")