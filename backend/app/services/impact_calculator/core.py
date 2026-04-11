import uuid
from sqlalchemy.orm import Session
from app.models.schema import Listing, WasteAnalysis, MaterialDetected, EnvironmentalImpactMetric

IMPACT_FACTORS = {
    "Concrete": {"co2_saved_kg": 0.12, "energy_saved_kwh": 0.5},
    "Steel": {"co2_saved_kg": 1.80, "energy_saved_kwh": 5.0},
    "Metal": {"co2_saved_kg": 1.80, "energy_saved_kwh": 5.0},
    "Wood": {"co2_saved_kg": 0.60, "energy_saved_kwh": 2.0},
    "Plastic": {"co2_saved_kg": 1.25, "energy_saved_kwh": 3.7},
    "Glass": {"co2_saved_kg": 0.85, "energy_saved_kwh": 1.5},
    "Bricks": {"co2_saved_kg": 0.15, "energy_saved_kwh": 0.6},
    "Default": {"co2_saved_kg": 0.50, "energy_saved_kwh": 1.0}
}

def calculate_and_save_impact(db: Session, listing_id: uuid.UUID):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        return
        
    analysis = db.query(WasteAnalysis).filter(WasteAnalysis.listing_id == listing_id).first()
    if not analysis:
        # Fallback if no AI calculation ran (use a static dummy value for demo)
        dummy_metric = EnvironmentalImpactMetric(
             user_id=listing.contractor_id,
             listing_id=listing.id,
             carbon_saved_kg=120.0,
             waste_diverted_kg=1000.0,
             co2_reduction_kg=120.0,
             energy_saved_kwh=500.0,
             total_waste_reused_kg=1000.0,
             landfill_waste_avoided_kg=1000.0
        )
        db.add(dummy_metric)
        db.flush()
        return
        
    materials = db.query(MaterialDetected).filter(MaterialDetected.analysis_id == analysis.id).all()
    
    total_reused = 0
    total_co2 = 0
    total_energy = 0
    
    for mat in materials:
        vol = float(mat.estimated_volume)
        total_reused += vol
        
        factor = IMPACT_FACTORS.get(mat.material_type, IMPACT_FACTORS["Default"])
        total_co2 += vol * factor["co2_saved_kg"]
        total_energy += vol * factor["energy_saved_kwh"]
    
    metric = EnvironmentalImpactMetric(
        user_id=listing.contractor_id,
        listing_id=listing.id,
        carbon_saved_kg=total_co2,
        waste_diverted_kg=total_reused,
        co2_reduction_kg=total_co2,
        energy_saved_kwh=total_energy,
        total_waste_reused_kg=total_reused,
        landfill_waste_avoided_kg=total_reused
    )
    db.add(metric)
    db.flush()
