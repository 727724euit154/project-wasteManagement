from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schema import User
from app.schemas import UserRead, UserUpdate
from app.api.deps import get_current_user
from app.core.security import get_password_hash
import uuid

router = APIRouter()

@router.get("/me", response_model=UserRead)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/{id}", response_model=UserRead)
def read_user(id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/update-profile", response_model=UserRead)
def update_profile(user_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_in.email:
        current_user.email = user_in.email
    if user_in.password:
        current_user.password_hash = get_password_hash(user_in.password)
    db.commit()
    db.refresh(current_user)
    return current_user
