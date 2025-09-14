"""
Main application runner for the Crop & Soil Recommendation System
"""

import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

def check_requirements():
    """Check if required packages are installed"""
    try:
        import fastapi
        import uvicorn
        import tensorflow
        import sklearn
        import pandas
        import numpy
        import PIL
        import joblib
        print("✅ All required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        print("Please install requirements: pip install -r backend/requirements.txt")
        return False

def start_backend():
    """Start the CropAI backend server"""
    print("🚀 Starting CropAI backend server...")
    
    # Change to backend/api directory
    backend_dir = Path(__file__).parent / "backend" / "api"
    os.chdir(backend_dir)
    
    # Start the server
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 CropAI server stopped by user")
    except Exception as e:
        print(f"❌ Error starting CropAI server: {e}")

def main():
    """Main application entry point"""
    print("🌱 CropAI - AI-Powered Agricultural Intelligence")
    print("=" * 55)
    
    # Check if we're in the right directory
    if not os.path.exists("backend/api/main.py"):
        print("❌ Please run this script from the project root directory")
        return
    
    # Check requirements
    if not check_requirements():
        return
    
    # Check if models exist
    model_files = [
        "model_outputs/soil_classifier_model.keras",
        "model_outputs/crop_model.pkl", 
        "model_outputs/crop_label_encoder.pkl"
    ]
    
    missing_models = [f for f in model_files if not os.path.exists(f)]
    if missing_models:
        print("❌ Missing AI model files:")
        for model in missing_models:
            print(f"   - {model}")
        print("Please ensure all AI model files are present before running CropAI")
        return
    
    print("✅ All AI model files found")
    print("🌐 Starting web server at: http://localhost:8000")
    print("📚 API documentation at: http://localhost:8000/api/docs")
    
    # Start the backend
    try:
        start_backend()
    except Exception as e:
        print(f"❌ Failed to start CropAI: {e}")

if __name__ == "__main__":
    main()
