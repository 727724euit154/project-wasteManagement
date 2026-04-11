from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import time
import os

app = FastAPI(
    title="Waste Intelligence AI Microservice",
    description="Processes images to classify waste materials",
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

@app.get("/")
def read_root():
    return {"status": "AI Microservice is running securely."}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/predict")
async def predict_waste(image: UploadFile = File(...)):
    # Fallback to keep compatibility
    start = time.time()
    file_bytes = await image.read()
    time.sleep(0.5)
    return {"filename": image.filename, "prediction": "Concrete", "confidence": 0.95}

from app.inference import analyze_waste_image

@app.post("/ai/analyze-image")
async def process_waste_detection(file: UploadFile = File(...)):
    # Main YOLOv8 hook mapping
    image_bytes = await file.read()
    start = time.time()
    results = analyze_waste_image(image_bytes)
    results["metadata"] = {
        "filename": file.filename, 
        "inference_ms": int((time.time() - start) * 1000)
    }
    return results
