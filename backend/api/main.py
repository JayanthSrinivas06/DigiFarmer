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
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from backend.models.combined_crop_soil_recommender import CombinedCropSoilRecommender

# Initialize FastAPI app
app = FastAPI(
    title="CropAI - Crop & Soil Recommendation System",
    description="AI-powered agricultural recommendation system using computer vision and machine learning",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files using absolute path
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend'))
app.mount("/frontend", StaticFiles(directory=frontend_dir), name="frontend")

# Initialize templates
templates = Jinja2Templates(directory="frontend/templates")

# Initialize the recommender
try:
    recommender = CombinedCropSoilRecommender(
        soil_model_path='model_outputs/soil_classifier_model.keras',
        crop_model_path='model_outputs/crop_model.pkl',
        crop_encoder_path='model_outputs/crop_label_encoder.pkl'
    )
    print("✅ AI Models loaded successfully!")
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
        raise HTTPException(status_code=500, detail="AI models not loaded")
    
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
        
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
            raise HTTPException(status_code=500, detail="Failed to classify soil type")
        
        return {
            "success": True,
            "soil_type": soil_type,
            "confidence": round(confidence, 2),
            "message": f"Soil classified as {soil_type} with {confidence:.1f}% confidence"
        }
    
    except Exception as e:
        # Clean up on error
        if 'tmp_file_path' in locals():
            try:
                os.unlink(tmp_file_path)
            except:
                pass
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
        raise HTTPException(status_code=500, detail="AI models not loaded")
    
    try:
        # Validate soil type
        if soil_type not in recommender.soil_classes:
            raise HTTPException(status_code=400, detail=f"Invalid soil type. Must be one of: {', '.join(recommender.soil_classes)}")
        
        # Parse environmental parameters if provided
        custom_params = None
        if environmental_params:
            try:
                custom_params = json.loads(environmental_params)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid environmental parameters format")
        
        # Get recommendations
        recommendations = recommender.recommend_crops(soil_type, custom_params, top_n)
        
        return {
            "success": True,
            "soil_type": soil_type,
            "recommendations": recommendations,
            "soil_specific_crops": recommender.soil_crop_mapping.get(soil_type, []),
            "total_recommendations": len(recommendations)
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
        raise HTTPException(status_code=500, detail="AI models not loaded")
    
    tmp_file_path = None
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
        
        # Check file size (10MB limit)
        content = await image.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Parse environmental parameters if provided
        custom_params = None
        if environmental_params:
            try:
                custom_params = json.loads(environmental_params)
                # Validate parameter ranges
                if custom_params:
                    for key, value in custom_params.items():
                        if not isinstance(value, (int, float)):
                            raise ValueError(f"Invalid value for {key}: must be a number")
            except (json.JSONDecodeError, ValueError) as e:
                raise HTTPException(status_code=400, detail=f"Invalid environmental parameters: {str(e)}")
        
        # Get complete analysis
        result = recommender.get_comprehensive_recommendation(
            tmp_file_path, 
            custom_params
        )
        
        # Clean up
        os.unlink(tmp_file_path)
        
        if 'error' in result:
            raise HTTPException(status_code=500, detail=result['error'])
        
        return {
            "success": True,
            "message": "Analysis completed successfully",
            **result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        # Clean up on any error
        if tmp_file_path and os.path.exists(tmp_file_path):
            try:
                os.unlink(tmp_file_path)
            except:
                pass

@app.get("/api/soil-types")
async def get_soil_types():
    """
    Get available soil types and their crop mappings
    """
    if not recommender:
        raise HTTPException(status_code=500, detail="AI models not loaded")
    
    return {
        "success": True,
        "soil_types": recommender.soil_classes,
        "soil_crop_mapping": recommender.soil_crop_mapping,
        "environmental_ranges": recommender.soil_environmental_ranges,
        "total_soil_types": len(recommender.soil_classes)
    }

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "service": "CropAI Backend",
        "models_loaded": recommender is not None,
        "version": "2.0.0",
        "timestamp": "2025-01-27T10:00:00Z"
    }

@app.get("/api/stats")
async def get_stats():
    """
    Get system statistics
    """
    if not recommender:
        raise HTTPException(status_code=500, detail="AI models not loaded")
    
    total_crops = len(recommender.crop_encoder.classes_) if recommender.crop_encoder else 0
    total_soil_types = len(recommender.soil_classes)
    
    return {
        "success": True,
        "statistics": {
            "total_soil_types": total_soil_types,
            "total_crops": total_crops,
            "supported_formats": ["JPG", "PNG", "WebP"],
            "max_file_size": "10MB",
            "analysis_time": "2-5 seconds"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
