from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schema import User
from app.schemas import UserCreate, UserRead, UserUpdate, Token
from app.core import security
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserRead)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = User(
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        role_id=user_in.role_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    return {"access_token": security.create_access_token(user.id), "token_type": "bearer"}

@router.get("/profile", response_model=UserRead)
def read_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserRead)
def update_profile(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_in.email:
        existing = db.query(User).filter(User.email == user_in.email).first()
        if existing and str(existing.id) != str(current_user.id):
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = user_in.email
    if user_in.password:
        current_user.password_hash = security.get_password_hash(user_in.password)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.delete("/profile")
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.delete(current_user)
    db.commit()
    return {"ok": True}
