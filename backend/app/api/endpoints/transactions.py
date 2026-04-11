from fastapi import APIRouter
from pydantic import BaseModel
import uuid

router = APIRouter()

class PurchaseRequest(BaseModel):
    listing_id: uuid.UUID
    amount: float

@router.post("/purchase")
def purchase_listing(request: PurchaseRequest):
    # For demo, return success without DB operations
    return {"message": "Purchase successful", "transaction_id": str(uuid.uuid4())}
