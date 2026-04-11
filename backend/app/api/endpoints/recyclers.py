from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.schema import RecyclerLocation, User
from app.schemas import RecyclerRead, RecyclerUpdateProfile
from app.api.deps import get_current_user
from typing import List

router = APIRouter()

@router.put("/profile", response_model=RecyclerRead)
def update_recycler_profile(config: RecyclerUpdateProfile, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    loc = db.query(RecyclerLocation).filter(RecyclerLocation.user_id == current_user.id).first()
    if not loc:
        # Instead of failing, mock create one for demo flexibility if none exists yet
        loc = RecyclerLocation(user_id=current_user.id, name=f"Recycler Facility {str(current_user.id)[:4]}", location="SRID=4326;POINT(0 0)")
        db.add(loc)
        
    if config.specialized_materials is not None:
        loc.specialized_materials = config.specialized_materials
    if config.processing_capacity_tons is not None:
        loc.processing_capacity_tons = config.processing_capacity_tons
    if config.service_radius_km is not None:
        loc.service_radius_km = config.service_radius_km
        
    db.commit()
    db.refresh(loc)
    
    return RecyclerRead(
        id=loc.id,
        user_id=loc.user_id,
        name=loc.name,
        address=loc.address,
        latitude=0, longitude=0
    )

@router.get("/", response_model=List[RecyclerRead])
def get_recyclers(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    results = db.query(
        RecyclerLocation,
        func.ST_Y(RecyclerLocation.location).label("latitude"),
        func.ST_X(RecyclerLocation.location).label("longitude")
    ).offset(skip).limit(limit).all()
    
    return [
        RecyclerRead(
            id=item.RecyclerLocation.id,
            user_id=item.RecyclerLocation.user_id,
            name=item.RecyclerLocation.name,
            address=item.RecyclerLocation.address,
            latitude=item.latitude,
            longitude=item.longitude
        ) for item in results
    ]

@router.get("/nearby", response_model=List[RecyclerRead])
def get_nearby_recyclers(latitude: float, longitude: float, radius_degrees: float = 0.1, db: Session = Depends(get_db)):
    # Simple ST_DWithin query using SRID 4326 geometry (radius is in degrees)
    point_wkt = f"SRID=4326;POINT({longitude} {latitude})"
    results = db.query(
        RecyclerLocation,
        func.ST_Y(RecyclerLocation.location).label("latitude"),
        func.ST_X(RecyclerLocation.location).label("longitude")
    ).filter(
        func.ST_DWithin(RecyclerLocation.location, func.ST_GeomFromEWKT(point_wkt), radius_degrees)
    ).all()
    
    return [
        RecyclerRead(
            id=item.RecyclerLocation.id,
            user_id=item.RecyclerLocation.user_id,
            name=item.RecyclerLocation.name,
            address=item.RecyclerLocation.address,
            latitude=item.latitude,
            longitude=item.longitude
        ) for item in results
    ]
