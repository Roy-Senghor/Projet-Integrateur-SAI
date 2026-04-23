from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base
 
 
class CommandeEnum(str, enum.Enum):
    ON  = "ON"
    OFF = "OFF"
 
 
class TypeDeclenchementEnum(str, enum.Enum):
    manuel      = "manuel"
    automatique = "automatique"
 
 
class Action(Base):
    __tablename__ = "actions"
 
    id                  = Column(Integer, primary_key=True, index=True)
    commande            = Column(Enum(CommandeEnum), nullable=False)
    type_declenchement  = Column(Enum(TypeDeclenchementEnum), default=TypeDeclenchementEnum.manuel)
    date_heure          = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    id_actionneur       = Column(Integer, ForeignKey("actionneurs.id"), nullable=False)
    id_user             = Column(Integer, ForeignKey("users.id"), nullable=True)
 
    actionneur = relationship("Actionneur", back_populates="actions")
    user       = relationship("User",       back_populates="actions")