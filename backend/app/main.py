from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Construction Waste Intelligence API",
    description="Backend for the Construction Waste Intelligence Platform",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.api import api_router
from sqlalchemy import text
from app.db.session import get_db
from sqlalchemy.orm import Session

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "online"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Construction Waste Intelligence API."}
