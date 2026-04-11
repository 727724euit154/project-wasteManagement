from fastapi import APIRouter
from app.schemas import ListingCreate, ListingRead, ListingDetailRead
from typing import Optional
import uuid

router = APIRouter()

@router.post("/create", response_model=ListingRead)
def create_listing(listing_in: ListingCreate):
    # For demo, bypass DB and return mock response with producer details
    from datetime import datetime
    mock_id = uuid.uuid4()
    dummy_contractor_id = uuid.uuid4()
    
    return ListingRead(
        id=mock_id,
        contractor_id=dummy_contractor_id,
        title=listing_in.title,
        description=listing_in.description,
        status=listing_in.status,
        created_at=datetime.utcnow(),
        latitude=listing_in.location.latitude,
        longitude=listing_in.location.longitude,
        price=listing_in.price,
        company_name=listing_in.company_name,
        contact_number=listing_in.contact_number
    )

@router.get("/", response_model=list[ListingRead])
def read_listings(skip: int = 0, limit: int = 20, recycler_lat: Optional[float] = None, recycler_lng: Optional[float] = None):
    # Return empty list - only show listings when producers publish them
    return []

@router.get("/{id}", response_model=ListingDetailRead)
def read_listing(id: uuid.UUID):
    # For demo, return mock listing detail with producer information
    from datetime import datetime
    
    # Mock different listings based on ID hash for variety
    id_hash = hash(str(id)) % 3
    
    if id_hash == 0:
        return ListingDetailRead(
            id=id,
            contractor_id=uuid.uuid4(),
            title="Metal Waste - 85% Pure",
            description="High-quality metal scrap from construction demolition. Perfect for recycling facilities.",
            status="active",
            created_at=datetime.utcnow(),
            latitude=40.7128,
            longitude=-74.0060,
            analysis=None,
            price=500.0,
            company_name="ABC Construction Co.",
            contact_number="+1-555-0123"
        )
    elif id_hash == 1:
        return ListingDetailRead(
            id=id,
            contractor_id=uuid.uuid4(),
            title="Wood Waste - 78% Pure",
            description="Clean timber waste from construction site. Suitable for wood recycling and processing.",
            status="active",
            created_at=datetime.utcnow(),
            latitude=40.7589,
            longitude=-73.9851,
            analysis=None,
            price=300.0,
            company_name="XYZ Builders Ltd.",
            contact_number="+1-555-0456"
        )
    else:
        return ListingDetailRead(
            id=id,
            contractor_id=uuid.uuid4(),
            title="Concrete Waste - 92% Pure",
            description="Crushed concrete from building demolition. High-quality aggregate material.",
            status="active",
            created_at=datetime.utcnow(),
            latitude=40.7505,
            longitude=-73.9934,
            analysis=None,
            price=200.0,
            company_name="Metro Demolition Inc.",
            contact_number="+1-555-0789"
        )

# @router.put("/update", response_model=ListingRead)
# def update_listing(id: uuid.UUID, status: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
#     listing = db.query(Listing).filter(Listing.id == id).first()
#     if not listing:
#         raise HTTPException(status_code=404, detail="Listing not found")
#     listing.status = status
#     db.commit()
#     db.refresh(listing)
#     return read_listing(id=id, db=db)

# @router.delete("/{id}")
# def delete_listing(id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
#     listing = db.query(Listing).filter(Listing.id == id).first()
#     if not listing:
#         raise HTTPException(status_code=404, detail="Listing not found")
#     db.delete(listing)
#     db.commit()
#     return {"ok": True}
