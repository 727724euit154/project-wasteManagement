import uuid
from sqlalchemy import Column, String, Text, Numeric, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.base_class import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
    
class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id", ondelete="RESTRICT"), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    role = relationship("Role")

class RecyclerLocation(Base):
    __tablename__ = "recycler_locations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name = Column(String(255), nullable=False)
    address = Column(Text)
    location = Column(Geometry('POINT', srid=4326), nullable=False)
    specialized_materials = Column(String(255))
    processing_capacity_tons = Column(Numeric(10, 2))
    service_radius_km = Column(Numeric(10, 2))

class Listing(Base):
    __tablename__ = "listings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contractor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    location = Column(Geometry('POINT', srid=4326), nullable=True)
    latitude = Column(Numeric(10, 6), nullable=True)
    longitude = Column(Numeric(10, 6), nullable=True)
    status = Column(String(50), default="available", index=True)
    price = Column(Numeric(15, 2), nullable=True)
    weight_kg = Column(Numeric(15, 2), nullable=True)
    company_name = Column(String(255), nullable=True)
    contact_number = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    contractor = relationship("User", foreign_keys=[contractor_id])

class WasteAnalysis(Base):
    __tablename__ = "waste_analysis"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), unique=True)
    image_url = Column(Text)
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now())
    listing = relationship("Listing")
    materials = relationship("MaterialDetected", back_populates="analysis", cascade="all, delete")
    score = relationship("ReusabilityScore", uselist=False, back_populates="analysis", cascade="all, delete")

class MaterialDetected(Base):
    __tablename__ = "materials_detected"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey("waste_analysis.id", ondelete="CASCADE"), index=True)
    material_type = Column(String(100), nullable=False, index=True)
    confidence = Column(Numeric(5, 4), nullable=False)
    estimated_volume = Column(Numeric(10, 2), nullable=False)
    analysis = relationship("WasteAnalysis", back_populates="materials")

class ReusabilityScore(Base):
    __tablename__ = "reusability_scores"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey("waste_analysis.id", ondelete="CASCADE"), unique=True)
    score = Column(Numeric(5, 2), nullable=False)
    reasoning = Column(Text)
    analysis = relationship("WasteAnalysis", back_populates="score")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="RESTRICT"), index=True)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    amount = Column(Numeric(15, 2), nullable=False)
    status = Column(String(50), default="completed")
    delivery_address = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LogisticsRequest(Base):
    __tablename__ = "logistics_requests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="RESTRICT"))
    logistics_partner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    pickup_location = Column(Geometry('POINT', srid=4326), nullable=False)
    dropoff_location = Column(Geometry('POINT', srid=4326), nullable=False)
    payment_offered_usd = Column(Numeric(15, 2), default=0)
    status = Column(String(50), default="requested")
    requested_at = Column(DateTime(timezone=True), server_default=func.now())

class WastePassport(Base):
    __tablename__ = "waste_passports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="RESTRICT"), unique=True)
    origin_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"))
    destination_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"))
    logistics_request_id = Column(UUID(as_uuid=True), ForeignKey("logistics_requests.id", ondelete="RESTRICT"))
    certification_hash = Column(String(255), nullable=False)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())

class EnvironmentalImpactMetric(Base):
    __tablename__ = "environmental_impact_metrics"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=True)
    carbon_saved_kg = Column(Numeric(15, 2), default=0)
    waste_diverted_kg = Column(Numeric(15, 2), default=0)
    co2_reduction_kg = Column(Numeric(15, 2), default=0)
    energy_saved_kwh = Column(Numeric(15, 2), default=0)
    total_waste_reused_kg = Column(Numeric(15, 2), default=0)
    landfill_waste_avoided_kg = Column(Numeric(15, 2), default=0)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
