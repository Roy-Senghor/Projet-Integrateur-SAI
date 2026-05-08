from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.user import RoleEnum
 
 
class UserCreate(BaseModel):
    nom: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.consultation
 
 
class UserUpdate(BaseModel):
    nom: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None
 
 
class UserOut(BaseModel):
    id: int
    nom: str
    email: str
    role: RoleEnum
    is_active: bool
    created_at: datetime
 
    class Config:
        from_attributes = True
 
 
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"