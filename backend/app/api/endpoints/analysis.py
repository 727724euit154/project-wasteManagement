import httpx
from fastapi import APIRouter, HTTPException, UploadFile, File
import uuid

router = APIRouter()

@router.post("/upload-image")
async def upload_image(listing_id: uuid.UUID, file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    import os
    ai_url = os.environ.get("AI_SERVICE_URL", "http://localhost:8001")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{ai_url}/ai/analyze-image",
                files={"file": (file.filename, image_bytes, file.content_type)}
            )
            response.raise_for_status()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI Service routing failed: {str(e)}")
            
    ai_data = response.json()
    materials_detected = ai_data.get("materials", [])
    
    # Temporarily disabled DB operations for demo
    # from app.models.schema import Listing
    # listing = db.query(Listing).filter(Listing.id == listing_id).first()
    # db_analysis_id = uuid.uuid4()
    
    # if listing:
    #     existing = db.query(WasteAnalysis).filter(WasteAnalysis.listing_id == listing_id).first()
    #     if existing:
    #         db.delete(existing)
    #         db.flush()
            
    #     db_analysis = WasteAnalysis(
    #         id=db_analysis_id,
    #         listing_id=listing_id,
    #         image_url=f"/storage/{listing_id}/{file.filename}"
    #     )
    #     db.add(db_analysis)
    #     db.flush() 
        
    #     for mat in materials_detected:
    #         db.add(MaterialDetected(
    #             analysis_id=db_analysis.id,
    #             material_type=mat["type"],
    #             confidence=mat["percentage"] / 100.0,
    #             estimated_volume=0.0
    #         ))
            
    #     db.commit()
        
    return {
        "message": "AI Analysis successful", 
        "analysis_id": str(uuid.uuid4()), 
        "materials": materials_detected
    }

# @router.get("/{listing_id}")
# def get_analysis_for_listing(listing_id: uuid.UUID, db: Session = Depends(get_db)):
#     analysis = db.query(WasteAnalysis).filter(WasteAnalysis.listing_id == listing_id).first()
#     if not analysis:
#         raise HTTPException(status_code=404, detail="Analysis not found for this listing")
#     return analysis
