from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user, hash_password
from app.models.user import User, RoleEnum
from app.schemas.user import UserCreate, UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["Utilisateurs"])

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé. Réservé aux administrateurs.")
    return current_user

@router.get("/", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(User).all()

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    new_user = User(
        nom=payload.nom,
        email=payload.email,
        password=hash_password(payload.password),
        role=payload.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    if payload.email and payload.email != user.email:
        if db.query(User).filter(User.email == payload.email).first():
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
        user.email = payload.email

    if payload.nom is not None:
        user.nom = payload.nom
    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        # Prevent admin from deactivating themselves
        if user.id == current_user.id and payload.is_active is False:
            raise HTTPException(status_code=400, detail="Vous ne pouvez pas désactiver votre propre compte")
        user.is_active = payload.is_active
    if payload.password:
        user.password = hash_password(payload.password)
        
    db.commit()
    db.refresh(user)
    return user
