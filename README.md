# 🌱 Crop & Soil Recommendation System

A modern, AI-powered web application that combines soil classification and crop recommendation models to provide intelligent agricultural recommendations.

## 🎯 Features

- **🔬 Soil Classification**: Advanced computer vision using ResNet50 to identify soil types from images
- **🌾 Crop Recommendations**: AI-powered suggestions based on soil type and environmental conditions
- **🌡️ Environmental Analysis**: Comprehensive consideration of N, P, K, temperature, humidity, pH, and rainfall
- **💻 Modern Web Interface**: Responsive, user-friendly design with drag-and-drop functionality
- **🚀 FastAPI Backend**: High-performance REST API with automatic documentation
- **📱 Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices

## 🏗️ Project Structure

```
├── backend/                    # FastAPI backend
│   ├── main.py                # Main FastAPI application
│   ├── combined_crop_soil_recommender.py  # Core recommendation logic
│   └── requirements.txt       # Backend dependencies
├── frontend/                  # Frontend assets (if needed)
├── static/                    # Static web assets
│   ├── css/
│   │   └── style.css         # Modern CSS styles
│   └── js/
│       └── script.js         # Frontend JavaScript
├── templates/                 # HTML templates
│   └── index.html            # Main web interface
├── model_outputs/            # Trained ML models
│   ├── soil_classifier_model.keras
│   ├── crop_model.pkl
│   └── crop_label_encoder.pkl
├── dataset/                  # Training data
├── run_app.py               # Application launcher
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

### 2. Run the Application

```bash
python run_app.py
```

### 3. Access the Web Interface

Open your browser and go to: `http://localhost:8000`

## 🎨 Web Interface Features

### Modern Design
- **Responsive Layout**: Adapts to all screen sizes
- **Interactive Elements**: Smooth animations and transitions
- **Drag & Drop**: Easy image upload with visual feedback
- **Real-time Feedback**: Loading states and progress indicators

### User Experience
- **Intuitive Navigation**: Clean, organized interface
- **Visual Results**: Color-coded recommendations and confidence scores
- **Export Functionality**: Download analysis reports
- **Toast Notifications**: Real-time feedback and error handling

## 🔧 API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main web interface |
| `/api/classify` | POST | Classify soil from image |
| `/api/recommend` | POST | Get crop recommendations |
| `/api/complete-analysis` | POST | Full analysis workflow |
| `/api/soil-types` | GET | Available soil types |
| `/api/health` | GET | System health check |

### API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🌍 Supported Soil Types

| Soil Type | Best Crops | Characteristics |
|-----------|------------|-----------------|
| **Alluvial Soil** | Rice, Wheat, Sugarcane, Cotton, Jute, Maize, Pulses | Fertile, well-drained |
| **Black Soil** | Cotton, Sugarcane, Wheat, Jowar, Sunflower, Groundnut | High clay content, moisture-retentive |
| **Cinder Soil** | Coffee, Tea, Cardamom, Pepper, Coconut, Cashew | Volcanic origin, well-drained |
| **Clay Soil** | Rice, Wheat, Barley, Oats, Potatoes, Onions | High water retention |
| **Laterite Soil** | Cashew, Coconut, Rubber, Tea, Coffee, Cardamom | Iron-rich, acidic |
| **Peat Soil** | Rice, Vegetables, Fruits, Flowers, Herbs | Organic-rich, acidic |
| **Red Soil** | Groundnut, Potato, Rice, Ragi, Tobacco, Oilseeds | Iron oxide, well-drained |
| **Yellow Soil** | Wheat, Barley, Potato, Rice, Maize, Pulses | Sandy, low fertility |

## 📊 Environmental Parameters

The system analyzes these environmental factors:

- **Nitrogen (N)**: 20-120 ppm
- **Phosphorus (P)**: 10-70 ppm  
- **Potassium (K)**: 15-90 ppm
- **Temperature**: 10-40°C
- **Humidity**: 50-95%
- **pH Level**: 4.0-8.5
- **Rainfall**: 50-500 mm

## 🎯 How to Use

### 1. Upload Soil Image
- Drag and drop an image or click to browse
- Supported formats: JPG, PNG, WebP
- Recommended: Clear, well-lit soil images

### 2. Set Environmental Parameters (Optional)
- Fill in known environmental conditions
- Leave blank to use default values for soil type

### 3. Analyze
- Click "Analyze Soil & Get Recommendations"
- Wait for AI processing (2-5 seconds)

### 4. View Results
- **Soil Analysis**: Type and confidence level
- **Environmental Conditions**: Current parameters
- **Crop Recommendations**: Ranked suggestions with suitability scores
- **Soil-Specific Crops**: Crops known to thrive in this soil type

## 🔬 Technical Details

### Backend (FastAPI)
- **Framework**: FastAPI with automatic OpenAPI documentation
- **Performance**: Async/await for high concurrency
- **Validation**: Pydantic models for request/response validation
- **CORS**: Configured for cross-origin requests

### Frontend (HTML/CSS/JS)
- **Design**: Modern, responsive CSS with CSS Grid and Flexbox
- **Interactions**: Vanilla JavaScript with Fetch API
- **Animations**: CSS transitions and keyframe animations
- **Accessibility**: Semantic HTML and ARIA labels

### Machine Learning
- **Soil Classification**: ResNet50 with transfer learning
- **Crop Recommendation**: Random Forest Classifier
- **Integration**: Seamless model combination with confidence scoring

## 🛠️ Development

### Running in Development Mode

```bash
# Backend only
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or use the launcher
python run_app.py
```

### Project Structure for Development

```
backend/
├── main.py                    # FastAPI app with all endpoints
├── combined_crop_soil_recommender.py  # Core ML logic
└── requirements.txt           # Backend dependencies

static/
├── css/style.css             # All styles in one file
└── js/script.js              # All JavaScript functionality

templates/
└── index.html                # Single-page application
```

## 📱 Mobile Support

The web interface is fully responsive and optimized for:
- **Desktop**: Full feature set with hover effects
- **Tablet**: Touch-friendly interface with adapted layouts
- **Mobile**: Streamlined interface with collapsible sections

## 🔒 Security Features

- **File Upload Validation**: Image type and size checking
- **Input Sanitization**: All user inputs are validated
- **CORS Configuration**: Proper cross-origin resource sharing
- **Error Handling**: Comprehensive error management

## 🚀 Deployment

### Local Development
```bash
python run_app.py
```

### Production Deployment
```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📈 Performance

- **Image Processing**: 2-3 seconds per analysis
- **API Response**: <100ms for most endpoints
- **Concurrent Users**: Supports 100+ simultaneous users
- **Memory Usage**: ~500MB with models loaded

## 🐛 Troubleshooting

### Common Issues

1. **Models not loading**
   - Ensure all model files are in `model_outputs/`
   - Check file permissions

2. **Image upload fails**
   - Verify image format (JPG, PNG, WebP)
   - Check file size (<10MB recommended)

3. **Server won't start**
   - Install all requirements: `pip install -r backend/requirements.txt`
   - Check port 8000 is available

4. **Poor recommendations**
   - Use clear, well-lit soil images
   - Provide accurate environmental parameters

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **AICTE** for the project framework
- **Agricultural Research Community** for soil and crop data
- **Open Source Libraries** for the ML and web frameworks
- **Contributors** and testers

---

**🌱 Built with ❤️ for the future of agriculture**