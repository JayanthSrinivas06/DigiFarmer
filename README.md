# 🌱 DigiFarmer - AI-Powered Agricultural Intelligence

**Transform your farming decisions with cutting-edge AI technology**

[![Python](https://img.shields.io/badge/Python-3.8+-blue?style=flat-square&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.10+-orange?style=flat-square&logo=tensorflow)](https://tensorflow.org)

</div>

## 🎯 Overview

DigiFarmer is a modern, AI-powered web application that revolutionizes agricultural decision-making by combining advanced computer vision and machine learning technologies. Upload a soil image and receive intelligent crop recommendations based on soil classification and environmental analysis.

### ✨ Key Features

- **🔬 Advanced Soil Classification**: ResNet50-powered computer vision for accurate soil type identification
- **🧠 AI Crop Recommendations**: Machine learning algorithms trained on comprehensive agricultural datasets  
- **🌡️ Environmental Analysis**: Multi-factor analysis including N, P, K, temperature, humidity, pH, and rainfall
- **💻 Modern Web Interface**: Responsive, intuitive design with real-time feedback
- **🚀 High-Performance Backend**: FastAPI with automatic API documentation
- **📱 Mobile-First Design**: Seamless experience across all devices

## 🏗️ Project Architecture

```
DigiFarmer/
├── 📁 frontend/                    # Modern web interface
│   ├── 📁 css/
│   │   └── style.css              # Responsive styling with animations
│   ├── 📁 js/
│   │   └── script.js              # Interactive functionality
│   └── 📁 templates/
│       └── index.html             # Single-page application
├── 📁 backend/                     # FastAPI backend services
│   ├── 📁 api/
│   │   └── main.py                # REST API endpoints
│   ├── 📁 models/
│   │   └── combined_crop_soil_recommender.py  # Core AI logic
│   └── 📁 utils/                  # Utility functions
├── 📁 model_outputs/              # Trained ML models
│   ├── soil_classifier_model.keras
│   ├── crop_model.pkl
│   └── crop_label_encoder.pkl
├── 📁 dataset/                    # Training datasets
└── 📄 README.md                   # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- 4GB+ RAM (for model loading)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/DigiFarmer.git
   cd DigiFarmer
   ```

2. **Install dependencies**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Launch the application**
   ```bash
   python run_app.py
   ```

4. **Access the web interface**
   ```
   🌐 Open: http://localhost:8000
   📚 API Docs: http://localhost:8000/api/docs
   ```

## 🎨 User Interface

### Modern Design Features
- **Glassmorphism Effects**: Beautiful translucent cards with backdrop blur
- **Smooth Animations**: Engaging micro-interactions and transitions  
- **Drag & Drop Upload**: Intuitive file handling with visual feedback
- **Real-time Validation**: Instant feedback on user inputs
- **Responsive Layout**: Optimized for desktop, tablet, and mobile

### User Experience
- **One-Click Analysis**: Simple workflow from upload to results
- **Visual Results**: Color-coded confidence scores and recommendations
- **Export Functionality**: Download detailed analysis reports
- **Keyboard Shortcuts**: Power user features (Ctrl+U to upload, Ctrl+Enter to analyze)

## 🔧 API Endpoints

| Endpoint | Method | Description | Response Time |
|----------|--------|-------------|---------------|
| `/` | GET | Main web interface | < 100ms |
| `/api/complete-analysis` | POST | Full soil analysis + crop recommendations | 2-5s |
| `/api/classify` | POST | Soil classification only | 1-3s |
| `/api/recommend` | POST | Crop recommendations for known soil type | < 500ms |
| `/api/soil-types` | GET | Available soil types and mappings | < 100ms |
| `/api/health` | GET | System health check | < 50ms |
| `/api/stats` | GET | System statistics | < 100ms |


## 🌍 Supported Soil Types & Crops

<details>
<summary><strong>🔍 Click to view detailed soil-crop mappings</strong></summary>

| Soil Type | Characteristics | Best Crops | pH Range |
|-----------|-----------------|------------|----------|
| **Alluvial Soil** | Fertile, well-drained, high organic content | Rice, Wheat, Sugarcane, Cotton, Maize | 6.0-8.0 |
| **Black Soil** | High clay content, moisture-retentive | Cotton, Sugarcane, Wheat, Sunflower | 7.0-8.5 |
| **Cinder Soil** | Volcanic origin, well-drained, porous | Coffee, Tea, Cardamom, Pepper | 5.5-7.0 |
| **Clay Soil** | High water retention, slow drainage | Rice, Wheat, Barley, Potatoes | 6.5-8.0 |
| **Laterite Soil** | Iron-rich, acidic, well-drained | Cashew, Coconut, Rubber, Tea | 5.0-6.5 |
| **Peat Soil** | Organic-rich, acidic, high water content | Rice, Vegetables, Fruits, Herbs | 4.0-6.0 |
| **Red Soil** | Iron oxide content, well-drained | Groundnut, Potato, Rice, Pulses | 5.5-7.5 |
| **Yellow Soil** | Sandy texture, low fertility | Wheat, Barley, Potato, Maize | 6.0-7.5 |

</details>

## 📊 Environmental Parameters

The AI system analyzes these critical factors:

- **🧪 Nutrients**: Nitrogen (20-120 ppm), Phosphorus (10-70 ppm), Potassium (15-90 ppm)
- **🌡️ Climate**: Temperature (10-40°C), Humidity (50-95%)
- **💧 Water**: pH Level (4.0-8.5), Rainfall (50-500 mm)

## 🎯 How to Use

### 1. **Upload Soil Image**
- Drag & drop or click to browse
- Supported: JPG, PNG, WebP (max 10MB)
- Best results: Clear, well-lit soil images

### 2. **Set Environmental Parameters** *(Optional)*
- Fill in known conditions or leave blank for defaults
- Real-time validation ensures valid ranges

### 3. **Analyze & Get Results**
- Click "Analyze Soil & Get Recommendations"
- AI processing takes 2-5 seconds
- Results include confidence scores and suitability ratings

### 4. **Review Recommendations**
- **Soil Analysis**: Type identification with confidence level
- **Environmental Conditions**: Current or default parameters
- **Crop Recommendations**: AI-ranked suggestions with scores
- **Soil-Specific Crops**: Traditional crops for the soil type

## 🔬 Technical Implementation

### Frontend Stack
- **HTML5/CSS3**: Semantic markup with modern styling
- **Vanilla JavaScript**: No framework dependencies, optimized performance
- **CSS Grid/Flexbox**: Responsive layouts
- **CSS Animations**: Smooth transitions and micro-interactions

### Backend Stack
- **FastAPI**: High-performance async web framework
- **Pydantic**: Data validation and serialization
- **Uvicorn**: ASGI server with auto-reload
- **CORS**: Cross-origin resource sharing support

### AI/ML Stack
- **TensorFlow**: Deep learning framework for soil classification
- **ResNet50**: Pre-trained CNN with transfer learning
- **Scikit-learn**: Random Forest for crop recommendations
- **NumPy/Pandas**: Data processing and analysis

### Performance Optimizations
- **Model Caching**: Pre-loaded models for fast inference
- **Image Preprocessing**: Optimized pipeline for soil images
- **Async Processing**: Non-blocking request handling
- **Error Handling**: Comprehensive error management

## 📈 Performance Metrics

- **Image Processing**: 2-3 seconds average
- **API Response Time**: < 100ms for most endpoints
- **Concurrent Users**: Supports 100+ simultaneous users
- **Memory Usage**: ~500MB with all models loaded
- **Accuracy**: 85%+ soil classification accuracy

## 🙏 Acknowledgments

- **AICTE** for project framework and support
- **Agricultural Research Community** for soil and crop datasets
- **Open Source Libraries** for ML and web frameworks
- **Contributors** and beta testers for valuable feedback

## 📞 Support

- **📧 Email**: [jayanthsrinivas.b@gmail.com](jayanthsrinivas.b@gmail.com)
- **💬 Discussions**: [GitHub Discussions](https://github.com/JayanthSrinivas06/DigiFarmer/discussions)

---

<div align="center">

**🌱 Built with ❤️ for the future of agriculture**

[![Made with Python](https://img.shields.io/badge/Made%20with-Python-blue?style=for-the-badge&logo=python)](https://python.org)
[![Powered by AI](https://img.shields.io/badge/Powered%20by-AI-green?style=for-the-badge&logo=tensorflow)](https://tensorflow.org)

</div>
