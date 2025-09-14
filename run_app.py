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
    """Start the FastAPI backend server"""
    print("🚀 Starting FastAPI backend server...")
    
    # Change to backend directory
    backend_dir = Path(__file__).parent / "backend"
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
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    """Main application entry point"""
    print("🌱 Crop & Soil Recommendation System")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("backend/main.py"):
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
        print("❌ Missing model files:")
        for model in missing_models:
            print(f"   - {model}")
        print("Please ensure all model files are present before running the application")
        return
    
    print("✅ All model files found")
    
    # Start the backend
    try:
        start_backend()
    except Exception as e:
        print(f"❌ Failed to start application: {e}")

if __name__ == "__main__":
    main()
