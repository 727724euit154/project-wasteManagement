from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schema import User, Transaction, Listing
from app.schemas import TransactionRead
from app.api.deps import get_current_user
from pydantic import BaseModel
import uuid

router = APIRouter()

class PurchaseRequest(BaseModel):
    listing_id: uuid.UUID
    amount: float
    delivery_address: str = ""

@router.post("/purchase", response_model=TransactionRead)
def purchase_listing(
    request: PurchaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(Listing).filter(Listing.id == request.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status != "available":
        raise HTTPException(status_code=400, detail="Listing is not available")

    listing.status = "sold"
    txn = Transaction(
        listing_id=request.listing_id,
        buyer_id=current_user.id,
        amount=request.amount,
        status="completed",
        delivery_address=request.delivery_address,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn

@router.get("/my", response_model=list[TransactionRead])
def my_purchases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Transaction).filter(
        Transaction.buyer_id == current_user.id
    ).order_by(Transaction.created_at.desc()).all()

@router.get("/{id}", response_model=TransactionRead)
def get_transaction(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    txn = db.query(Transaction).filter(Transaction.id == id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if str(txn.buyer_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your transaction")
    return txn

@router.delete("/{id}")
def cancel_transaction(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    txn = db.query(Transaction).filter(Transaction.id == id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Not found")
    if str(txn.buyer_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your transaction")
    # Restore listing to available
    listing = db.query(Listing).filter(Listing.id == txn.listing_id).first()
    if listing:
        listing.status = "available"
    db.delete(txn)
    db.commit()
    return {"ok": True}
