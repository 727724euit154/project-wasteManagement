from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.schema import User, Listing
from app.schemas import ListingCreate, ListingRead, ListingDetailRead, ListingUpdate
from app.api.deps import get_current_user
from typing import Optional
import uuid

router = APIRouter()

def listing_to_read(l: Listing) -> dict:
    return {
        "id": l.id,
        "contractor_id": l.contractor_id,
        "title": l.title,
        "description": l.description,
        "status": l.status,
        "created_at": l.created_at,
        "latitude": l.latitude,
        "longitude": l.longitude,
        "price": float(l.price) if l.price else None,
        "weight_kg": float(l.weight_kg) if l.weight_kg else None,
        "company_name": l.company_name,
        "contact_number": l.contact_number,
    }

@router.post("/", response_model=ListingRead)
def create_listing(
    listing_in: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    l = Listing(
        contractor_id=current_user.id,
        title=listing_in.title,
        description=listing_in.description,
        latitude=listing_in.location.latitude,
        longitude=listing_in.location.longitude,
        status=listing_in.status or "available",
        price=listing_in.price,
        weight_kg=listing_in.weight_kg,
        company_name=listing_in.company_name,
        contact_number=listing_in.contact_number,
    )
    db.add(l)
    db.commit()
    db.refresh(l)
    return listing_to_read(l)

@router.get("/", response_model=list[ListingRead])
def read_listings(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Listing)
    if status:
        q = q.filter(Listing.status == status)
    else:
        q = q.filter(Listing.status == "available")
    listings = q.order_by(Listing.created_at.desc()).offset(skip).limit(limit).all()
    return [listing_to_read(l) for l in listings]

@router.get("/my", response_model=list[ListingRead])
def read_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listings = db.query(Listing).filter(
        Listing.contractor_id == current_user.id
    ).order_by(Listing.created_at.desc()).all()
    return [listing_to_read(l) for l in listings]

@router.get("/{id}", response_model=ListingDetailRead)
def read_listing(id: uuid.UUID, db: Session = Depends(get_db)):
    l = db.query(Listing).filter(Listing.id == id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing_to_read(l)

@router.put("/{id}", response_model=ListingRead)
def update_listing(
    id: uuid.UUID,
    listing_in: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    l = db.query(Listing).filter(Listing.id == id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    if str(l.contractor_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your listing")
    if listing_in.title is not None: l.title = listing_in.title
    if listing_in.description is not None: l.description = listing_in.description
    if listing_in.status is not None: l.status = listing_in.status
    if listing_in.price is not None: l.price = listing_in.price
    if listing_in.weight_kg is not None: l.weight_kg = listing_in.weight_kg
    if listing_in.company_name is not None: l.company_name = listing_in.company_name
    if listing_in.contact_number is not None: l.contact_number = listing_in.contact_number
    db.commit()
    db.refresh(l)
    return listing_to_read(l)

@router.delete("/{id}")
def delete_listing(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    l = db.query(Listing).filter(Listing.id == id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    if str(l.contractor_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your listing")
    db.delete(l)
    db.commit()
    return {"ok": True}
