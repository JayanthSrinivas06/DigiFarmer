"""
Combined Crop and Soil Recommendation System

This script combines the soil classification model and crop recommendation model
to provide crop suggestions based on soil type and environmental conditions.
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
import joblib
from PIL import Image
import warnings
warnings.filterwarnings('ignore')

class CombinedCropSoilRecommender:
    def __init__(self, soil_model_path, crop_model_path, crop_encoder_path):
        """
        Initialize the combined recommendation system.
        
        Args:
            soil_model_path: Path to the trained soil classification model
            crop_model_path: Path to the trained crop recommendation model
            crop_encoder_path: Path to the crop label encoder
        """
        # Load soil classification model
        self.soil_model = keras.models.load_model(soil_model_path)
        self.soil_classes = ['Alluvial Soil', 'Black Soil', 'Cinder Soil', 'Clay Soil', 
                            'Laterite Soil', 'Peat Soil', 'Red Soil', 'Yellow Soil']
        
        # Load crop recommendation model and encoder
        self.crop_model = joblib.load(crop_model_path)
        self.crop_encoder = joblib.load(crop_encoder_path)
        
        # Soil-to-crop mapping based on agricultural knowledge
        self.soil_crop_mapping = {
            'Alluvial Soil': ['rice', 'wheat', 'sugarcane', 'cotton', 'jute', 'maize', 'pulses'],
            'Black Soil': ['cotton', 'sugarcane', 'wheat', 'jowar', 'sunflower', 'groundnut', 'pulses'],
            'Cinder Soil': ['coffee', 'tea', 'cardamom', 'pepper', 'coconut', 'cashew'],
            'Clay Soil': ['rice', 'wheat', 'barley', 'oats', 'potatoes', 'onions'],
            'Laterite Soil': ['cashew', 'coconut', 'rubber', 'tea', 'coffee', 'cardamom'],
            'Peat Soil': ['rice', 'vegetables', 'fruits', 'flowers', 'herbs'],
            'Red Soil': ['groundnut', 'potato', 'rice', 'ragi', 'tobacco', 'oilseeds', 'pulses'],
            'Yellow Soil': ['wheat', 'barley', 'potato', 'rice', 'maize', 'pulses']
        }
        
        # Environmental parameter ranges for different soil types
        self.soil_environmental_ranges = {
            'Alluvial Soil': {
                'N': (50, 100), 'P': (30, 60), 'K': (30, 60),
                'temperature': (20, 35), 'humidity': (60, 90), 'pH': (6.0, 8.0), 'rainfall': (100, 300)
            },
            'Black Soil': {
                'N': (40, 80), 'P': (20, 50), 'K': (40, 80),
                'temperature': (25, 40), 'humidity': (50, 80), 'pH': (7.0, 8.5), 'rainfall': (50, 200)
            },
            'Cinder Soil': {
                'N': (30, 60), 'P': (15, 40), 'K': (20, 50),
                'temperature': (15, 30), 'humidity': (70, 95), 'pH': (5.5, 7.0), 'rainfall': (200, 400)
            },
            'Clay Soil': {
                'N': (60, 100), 'P': (40, 70), 'K': (50, 90),
                'temperature': (15, 30), 'humidity': (60, 85), 'pH': (6.5, 8.0), 'rainfall': (100, 250)
            },
            'Laterite Soil': {
                'N': (20, 50), 'P': (10, 30), 'K': (15, 40),
                'temperature': (20, 35), 'humidity': (60, 90), 'pH': (5.0, 6.5), 'rainfall': (150, 300)
            },
            'Peat Soil': {
                'N': (80, 120), 'P': (30, 60), 'K': (20, 50),
                'temperature': (10, 25), 'humidity': (70, 95), 'pH': (4.0, 6.0), 'rainfall': (200, 500)
            },
            'Red Soil': {
                'N': (30, 70), 'P': (20, 50), 'K': (25, 60),
                'temperature': (20, 35), 'humidity': (50, 80), 'pH': (5.5, 7.5), 'rainfall': (50, 200)
            },
            'Yellow Soil': {
                'N': (40, 80), 'P': (25, 55), 'K': (30, 70),
                'temperature': (15, 30), 'humidity': (60, 85), 'pH': (6.0, 7.5), 'rainfall': (100, 300)
            }
        }
    
    def classify_soil(self, image_path):
        """
        Classify soil type from image.
        
        Args:
            image_path: Path to the soil image
            
        Returns:
            tuple: (predicted_soil_type, confidence_score)
        """
        try:
            # Load and preprocess image
            img = tf.keras.utils.load_img(image_path, target_size=(224, 224))
            img_array = tf.keras.utils.img_to_array(img)
            img_batch = tf.expand_dims(img_array, 0)
            
            # Make prediction
            prediction = self.soil_model.predict(img_batch, verbose=0)
            score = tf.nn.softmax(prediction[0])
            
            predicted_class_index = np.argmax(score)
            predicted_soil_type = self.soil_classes[predicted_class_index]
            confidence = float(np.max(score)) * 100
            
            return predicted_soil_type, confidence
            
        except Exception as e:
            print(f"Error in soil classification: {e}")
            return None, 0.0
    
    def get_environmental_parameters(self, soil_type, custom_params=None):
        """
        Get environmental parameters for a given soil type.
        
        Args:
            soil_type: The classified soil type
            custom_params: Custom environmental parameters (optional)
            
        Returns:
            dict: Environmental parameters
        """
        if custom_params:
            return custom_params
        
        # Get default ranges for the soil type
        ranges = self.soil_environmental_ranges.get(soil_type, {})
        
        # Generate typical values within the ranges
        params = {}
        for param, (min_val, max_val) in ranges.items():
            # Use middle value of the range as typical
            params[param] = (min_val + max_val) / 2
        
        return params
    
    def recommend_crops(self, soil_type, environmental_params=None, top_n=5):
        """
        Recommend crops based on soil type and environmental conditions.
        
        Args:
            soil_type: The classified soil type
            environmental_params: Environmental parameters (optional)
            top_n: Number of top recommendations to return
            
        Returns:
            list: List of recommended crops with scores
        """
        try:
            # Get environmental parameters
            env_params = self.get_environmental_parameters(soil_type, environmental_params)
            
            # Prepare input for crop model
            crop_input = np.array([[
                env_params['N'],
                env_params['P'],
                env_params['K'],
                env_params['temperature'],
                env_params['humidity'],
                env_params['pH'],
                env_params['rainfall']
            ]])
            
            # Get crop predictions
            crop_probabilities = self.crop_model.predict_proba(crop_input)[0]
            crop_names = self.crop_encoder.classes_
            
            # Get soil-specific crop recommendations
            soil_specific_crops = self.soil_crop_mapping.get(soil_type, [])
            
            # Create recommendations with scores
            recommendations = []
            for i, (crop_name, prob) in enumerate(zip(crop_names, crop_probabilities)):
                # Boost score if crop is suitable for the soil type
                soil_boost = 1.5 if crop_name in soil_specific_crops else 1.0
                adjusted_score = prob * soil_boost
                
                recommendations.append({
                    'crop': crop_name,
                    'score': adjusted_score,
                    'soil_suitable': crop_name in soil_specific_crops,
                    'original_probability': prob
                })
            
            # Sort by adjusted score and return top N
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            
            return recommendations[:top_n]
            
        except Exception as e:
            print(f"Error in crop recommendation: {e}")
            return []
    
    def get_comprehensive_recommendation(self, image_path, custom_env_params=None, top_n=5):
        """
        Get comprehensive crop recommendation based on soil image and optional environmental parameters.
        
        Args:
            image_path: Path to the soil image
            custom_env_params: Custom environmental parameters (optional)
            top_n: Number of top recommendations to return
            
        Returns:
            dict: Comprehensive recommendation results
        """
        # Classify soil
        soil_type, soil_confidence = self.classify_soil(image_path)
        
        if soil_type is None:
            return {
                'error': 'Failed to classify soil type',
                'soil_type': None,
                'soil_confidence': 0.0,
                'recommendations': []
            }
        
        # Get environmental parameters
        env_params = self.get_environmental_parameters(soil_type, custom_env_params)
        
        # Get crop recommendations
        recommendations = self.recommend_crops(soil_type, env_params, top_n)
        
        return {
            'soil_type': soil_type,
            'soil_confidence': soil_confidence,
            'environmental_parameters': env_params,
            'recommendations': recommendations,
            'soil_specific_crops': self.soil_crop_mapping.get(soil_type, [])
        }
    
    def print_recommendation(self, result):
        """
        Print formatted recommendation results.
        
        Args:
            result: Result from get_comprehensive_recommendation
        """
        if 'error' in result:
            print(f"Error: {result['error']}")
            return
        
        print("=" * 60)
        print("🌱 COMBINED CROP & SOIL RECOMMENDATION SYSTEM")
        print("=" * 60)
        
        print(f"\n🌍 SOIL ANALYSIS:")
        print(f"   Soil Type: {result['soil_type']}")
        print(f"   Confidence: {result['soil_confidence']:.1f}%")
        
        print(f"\n🌡️  ENVIRONMENTAL CONDITIONS:")
        env = result['environmental_parameters']
        print(f"   Nitrogen (N): {env['N']:.1f}")
        print(f"   Phosphorus (P): {env['P']:.1f}")
        print(f"   Potassium (K): {env['K']:.1f}")
        print(f"   Temperature: {env['temperature']:.1f}°C")
        print(f"   Humidity: {env['humidity']:.1f}%")
        print(f"   pH Level: {env['pH']:.1f}")
        print(f"   Rainfall: {env['rainfall']:.1f}mm")
        
        print(f"\n🌾 RECOMMENDED CROPS:")
        for i, rec in enumerate(result['recommendations'], 1):
            soil_indicator = "✅" if rec['soil_suitable'] else "⚠️"
            print(f"   {i}. {rec['crop'].title()} {soil_indicator}")
            print(f"      Score: {rec['score']:.3f} (Original: {rec['original_probability']:.3f})")
        
        print(f"\n💡 SOIL-SPECIFIC CROPS FOR {result['soil_type'].upper()}:")
        for crop in result['soil_specific_crops']:
            print(f"   • {crop.title()}")
        
        print("=" * 60)

def main():
    """
    Example usage of the CombinedCropSoilRecommender.
    """
    # Initialize the recommender
    recommender = CombinedCropSoilRecommender(
        soil_model_path='../../model_outputs/soil_classifier_model.keras',
        crop_model_path='../../model_outputs/crop_model.pkl',
        crop_encoder_path='../../model_outputs/crop_label_encoder.pkl'
    )
    
    # Example 1: Using soil image only
    print("Example 1: Soil Image Analysis")
    image_path = '../../dataset/dummies/black.jpg'  # Replace with your image path
    
    result = recommender.get_comprehensive_recommendation(image_path)
    recommender.print_recommendation(result)
    
    # Example 2: Using custom environmental parameters
    print("\n\nExample 2: Custom Environmental Parameters")
    custom_params = {
        'N': 75, 'P': 45, 'K': 50,
        'temperature': 28, 'humidity': 75, 'pH': 6.8, 'rainfall': 180
    }
    
    result2 = recommender.get_comprehensive_recommendation(
        image_path, custom_env_params=custom_params
    )
    recommender.print_recommendation(result2)

if __name__ == "__main__":
    main()