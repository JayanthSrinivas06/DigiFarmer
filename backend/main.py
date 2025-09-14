"""
FastAPI Backend for Combined Crop & Soil Recommendation System
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import tempfile
import json
from typing import Optional, List, Dict, Any
import sys

# Add parent directory to path to import the recommender
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from combined_crop_soil_recommender import CombinedCropSoilRecommender

# Initialize FastAPI app
app = FastAPI(
    title="Crop & Soil Recommendation System",
    description="AI-powered agricultural recommendation system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="../static"), name="static")

# Initialize templates
templates = Jinja2Templates(directory="../templates")

# Initialize the recommender
try:
    recommender = CombinedCropSoilRecommender(
        soil_model_path='../model_outputs/soil_classifier_model.keras',
        crop_model_path='../model_outputs/crop_model.pkl',
        crop_encoder_path='../model_outputs/crop_label_encoder.pkl'
    )
    print("✅ Models loaded successfully!")
except Exception as e:
    print(f"❌ Error loading models: {e}")
    recommender = None

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    return templates.TemplateResponse("index.html", {"request": {}})

@app.post("/api/classify")
async def classify_soil(image: UploadFile = File(...)):
    """
    Classify soil type from uploaded image
    """
    if not recommender:
        raise HTTPException(status_code=500, detail="Models not loaded")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            content = await image.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Classify soil
        soil_type, confidence = recommender.classify_soil(tmp_file_path)
        
        # Clean up
        os.unlink(tmp_file_path)
        
        if soil_type is None:
            raise HTTPException(status_code=500, detail="Failed to classify soil")
        
        return {
            "success": True,
            "soil_type": soil_type,
            "confidence": round(confidence, 2)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommend")
async def recommend_crops(
    soil_type: str = Form(...),
    environmental_params: Optional[str] = Form(None),
    top_n: int = Form(5)
):
    """
    Get crop recommendations for a soil type
    """
    if not recommender:
        raise HTTPException(status_code=500, detail="Models not loaded")
    
    try:
        # Parse environmental parameters if provided
        custom_params = None
        if environmental_params:
            custom_params = json.loads(environmental_params)
        
        # Get recommendations
        recommendations = recommender.recommend_crops(soil_type, custom_params, top_n)
        
        return {
            "success": True,
            "recommendations": recommendations,
            "soil_specific_crops": recommender.soil_crop_mapping.get(soil_type, [])
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/complete-analysis")
async def complete_analysis(
    image: UploadFile = File(...),
    environmental_params: Optional[str] = Form(None)
):
    """
    Perform complete analysis: soil classification + crop recommendations
    """
    if not recommender:
        raise HTTPException(status_code=500, detail="Models not loaded")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            content = await image.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Parse environmental parameters if provided
        custom_params = None
        if environmental_params:
            custom_params = json.loads(environmental_params)
        
        # Get complete analysis
        result = recommender.get_comprehensive_recommendation(
            tmp_file_path, 
            custom_params
        )
        
        # Clean up
        os.unlink(tmp_file_path)
        
        return {
            "success": True,
            **result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/soil-types")
async def get_soil_types():
    """
    Get available soil types and their crop mappings
    """
    if not recommender:
        raise HTTPException(status_code=500, detail="Models not loaded")
    
    return {
        "success": True,
        "soil_types": recommender.soil_classes,
        "soil_crop_mapping": recommender.soil_crop_mapping,
        "environmental_ranges": recommender.soil_environmental_ranges
    }

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "models_loaded": recommender is not None,
        "timestamp": "2025-09-14T19:30:00Z"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
