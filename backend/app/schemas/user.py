from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import RoleEnum
 
 
class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    mot_de_passe: str
    role: RoleEnum = RoleEnum.consultation
 
 
class UserOut(BaseModel):
    id: int
    nom: str
    prenom: str
    email: EmailStr
    role: RoleEnum
    date_creation: datetime
 
    class Config:
        from_attributes = True
 
 
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"