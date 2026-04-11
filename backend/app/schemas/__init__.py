from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class Token(BaseModel):
    access_token: str
    token_type: str

class RoleRead(BaseModel):
    id: UUID
    name: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role_id: Optional[UUID] = None
    role: Optional[str] = None  # frontend role string e.g. "producer"

class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    role_id: Optional[UUID] = None
    created_at: datetime
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class LocationParams(BaseModel):
    latitude: float
    longitude: float

class ListingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: LocationParams
    status: Optional[str] = "available"
    price: Optional[float] = None
    weight_kg: Optional[float] = None
    company_name: str
    contact_number: str

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = None
    weight_kg: Optional[float] = None
    company_name: Optional[str] = None
    contact_number: Optional[str] = None

class ListingRead(BaseModel):
    id: UUID
    contractor_id: UUID
    title: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price: Optional[float] = None
    weight_kg: Optional[float] = None
    company_name: Optional[str] = None
    contact_number: Optional[str] = None
    class Config:
        from_attributes = True

class MaterialDetectedRead(BaseModel):
    id: UUID
    material_type: str
    confidence: float
    estimated_volume: float
    class Config:
        from_attributes = True

class ReusabilityScoreRead(BaseModel):
    id: UUID
    score: float
    reasoning: Optional[str] = None
    class Config:
        from_attributes = True

class WasteAnalysisRead(BaseModel):
    id: UUID
    image_url: Optional[str] = None
    analyzed_at: datetime
    materials: List[MaterialDetectedRead] = []
    score: Optional[ReusabilityScoreRead] = None
    class Config:
        from_attributes = True

class ListingDetailRead(ListingRead):
    analysis: Optional[WasteAnalysisRead] = None

class TransactionRead(BaseModel):
    id: UUID
    listing_id: UUID
    buyer_id: UUID
    amount: float
    status: str
    delivery_address: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class RecyclerUpdateProfile(BaseModel):
    specialized_materials: Optional[str] = None
    processing_capacity_tons: Optional[float] = None
    service_radius_km: Optional[float] = None

class RecyclerRead(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class LogisticsRequestCreate(BaseModel):
    listing_id: UUID
    logistics_partner_id: Optional[UUID] = None
    pickup_location: LocationParams
    dropoff_location: LocationParams

class LogisticsRequestRead(BaseModel):
    id: UUID
    listing_id: UUID
    logistics_partner_id: Optional[UUID] = None
    status: str
    requested_at: datetime
    class Config:
        from_attributes = True

class ImpactSummaryRead(BaseModel):
    carbon_saved_kg: float
    waste_diverted_kg: float
