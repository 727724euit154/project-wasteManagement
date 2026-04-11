from fastapi import APIRouter
from app.api.endpoints import auth, users, listings, analysis, recyclers, logistics, impact, transactions

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(listings.router, prefix="/listings", tags=["Listings"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Material Analysis"])
api_router.include_router(recyclers.router, prefix="/recyclers", tags=["Recyclers"])
api_router.include_router(logistics.router, prefix="/logistics", tags=["Logistics"])
api_router.include_router(impact.router, prefix="/impact", tags=["Environmental Impact"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
