from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import RoleEnum
 
 
class UserCreate(BaseModel):
    nom: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.consultation
 
 
class UserOut(BaseModel):
    id: int
    nom: str
    email: EmailStr
    role: RoleEnum
    is_active: bool
    created_at: datetime
 
    class Config:
        from_attributes = True
 
 
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"