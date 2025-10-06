from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import sys

app = Flask(__name__)
CORS(app)

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Define the model paths
regression_model_path = os.path.join(current_dir, "models/best_regression_model.joblib")
classification_model_path = os.path.join(current_dir, "models/best_classification_model.joblib")

# Validate model files exist
print("Validating model files...")
if not os.path.exists(regression_model_path):
    print(f"❌ Regression model file not found: {regression_model_path}")
    print("Please ensure the best_regression_model.joblib file exists.")
    sys.exit(1)
else:
    print(f"✅ Found best regression model: {regression_model_path}")

if not os.path.exists(classification_model_path):
    print(f"❌ Classification model file not found: {classification_model_path}")
    print("Please ensure the best_classification_model.joblib file exists.")
    sys.exit(1)
else:
    print(f"✅ Found best classification model: {classification_model_path}")

# Load the best models
print("Loading models...")
try:
    print("Loading best_regression_model...")
    regression_model = joblib.load(regression_model_path)
    print("✅ Successfully loaded best_regression_model")
    
    print("Loading best_classification_model...")
    classification_model = joblib.load(classification_model_path)
    print("✅ Successfully loaded best_classification_model")
except Exception as e:
    print(f"❌ Failed to load models: {e}")
    sys.exit(1)

print("✨ Best models loaded successfully!")

def prepare_features(raw_features):
    """
    Transform 6 raw input features into the 8 features used during model training.
    Expected raw_features order: [WorkoutTime, ReadingTime, PhoneTime, WorkHours, CaffeineIntake, RelaxationTime]
    Returns features in the order used during training: [WorkoutTime, ReadingTime, PhoneTime, WorkHours, CaffeineIntake, RelaxationTime, TotalActivityTime, SleepDeficit]
    """
    workout_time = raw_features[0]
    reading_time = raw_features[1] 
    phone_time = raw_features[2]
    work_hours = raw_features[3]
    caffeine_intake = raw_features[4]
    relaxation_time = raw_features[5]
    
    # Calculate engineered features exactly as done during training
    # For overlapping activities, we cap the total at 24 hours to prevent unrealistic predictions
    total_activity_time = min(24.0, workout_time + reading_time + phone_time + work_hours + relaxation_time)
    
    # For sleep deficit, we'll use a placeholder since we don't know the actual sleep time yet
    # This will be updated after prediction
    sleep_deficit = 0.0
    
    # Return features in the exact order used during training
    # Based on feature_cols from train_models.py: ['WorkoutTime','ReadingTime','PhoneTime','WorkHours','CaffeineIntake','RelaxationTime','TotalActivityTime','SleepDeficit']
    return [
        workout_time,
        reading_time,
        phone_time,
        work_hours,
        caffeine_intake,
        relaxation_time,
        total_activity_time,
        sleep_deficit
    ]

def make_prediction(regression_model, classification_model, features):
    try:
        # Validate input features
        if not isinstance(features, list) or len(features) != 6:
            return {"error": "Features must be a list of exactly 6 numeric values: [WorkoutTime, ReadingTime, PhoneTime, WorkHours, CaffeineIntake, RelaxationTime]"}
        
        # Validate all features are numeric
        for i, feature in enumerate(features):
            if not isinstance(feature, (int, float)) or feature < 0:
                return {"error": f"Feature {i+1} must be a non-negative number"}
        
        # Transform features to match training format
        model_features = prepare_features(features)
        
        # Log the features for debugging
        print(f"Input features: {features}")
        print(f"Model features: {model_features}")
        
        # Make prediction with regression model
        features_array = np.array(model_features).reshape(1, -1)  # Include all 8 features
        raw_prediction = regression_model.predict(features_array)[0]
        print(f"Raw prediction: {raw_prediction}")
        
        # Apply sleep constraints (6-12 hours)
        constrained_prediction = max(6.0, min(12.0, raw_prediction))
        print(f"Constrained prediction: {constrained_prediction}")
        
        # Update sleep deficit using the constrained prediction
        # SleepDeficit = RECOMMENDED_SLEEP (8 hours) - Actual Predicted Sleep
        model_features[7] = 8.0 - constrained_prediction
        print(f"Updated SleepDeficit: {model_features[7]}")
        
        # Make final prediction with updated sleep deficit
        features_array = np.array(model_features).reshape(1, -1)
        final_prediction = regression_model.predict(features_array)[0]
        print(f"Final raw prediction: {final_prediction}")
        final_constrained = max(6.0, min(12.0, final_prediction))
        print(f"Final constrained prediction: {final_constrained}")
        
        # Make classification prediction
        classification_result = classification_model.predict(features_array)[0]
        
        # Calculate sleep quality based on classification
        if classification_result == "Good":
            sleep_quality = "Good"
            quality_score = 85
        elif classification_result == "Normal":
            sleep_quality = "Normal"
            quality_score = 70
        else:  # "Bad"
            sleep_quality = "Poor"
            quality_score = 50
        
        # Determine if constraint was applied
        was_constrained = abs(raw_prediction - constrained_prediction) > 0.01 or abs(final_prediction - final_constrained) > 0.01
        
        return {
            "prediction": round(final_constrained, 2),
            "raw_prediction": round(raw_prediction, 2),
            "final_raw_prediction": round(final_prediction, 2),
            "was_constrained": bool(was_constrained),
            "sleep_category": classification_result,
            "sleep_quality": sleep_quality,
            "quality_score": quality_score,
            "health_insights": {
                "minimum_healthy_sleep": 6.0,
                "maximum_healthy_sleep": 12.0,
                "meets_minimum_requirement": bool(final_constrained >= 6.0)
            },
            "features_used": {
                "workout_time": float(features[0]),
                "reading_time": float(features[1]),
                "phone_time": float(features[2]),
                "work_hours": float(features[3]),
                "caffeine_intake": float(features[4]),
                "relaxation_time": float(features[5]),
                "total_activity_time": round(float(model_features[6]), 2),
                "sleep_deficit": round(float(model_features[7]), 2)
            }
        }
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify server and models are working"""
    try:
        # Test models with sample data - 6 raw features as expected from frontend
        test_features = [1.5, 0.5, 2.0, 8.0, 150.0, 1.0]  # [WorkoutTime, ReadingTime, PhoneTime, WorkHours, CaffeineIntake, RelaxationTime]
        
        try:
            test_result = make_prediction(regression_model, classification_model, test_features)
            if "prediction" in test_result:
                model_status = {
                    "status": "healthy",
                    "test_prediction": float(test_result["prediction"]),
                    "constraints_working": bool(test_result["was_constrained"] is not None),
                    "sleep_category": test_result["sleep_category"]
                }
            else:
                model_status = {"status": "error", "error": test_result.get("error", "Unknown")}
        except Exception as e:
            model_status = {"status": "error", "error": str(e)}
        
        return jsonify({
            "status": "healthy",
            "models_loaded": True,
            "models_name": "Best Regression and Classification Models",
            "model_status": model_status,
            "constraints": {
                "minimum_sleep_hours": 6.0,
                "maximum_sleep_hours": 12.0
            },
            "feature_requirements": {
                "input_features": 6,
                "expected_order": ["WorkoutTime", "ReadingTime", "PhoneTime", "WorkHours", "CaffeineIntake", "RelaxationTime"],
                "engineered_features": ["TotalActivityTime", "SleepDeficit"]
            },
            "server_info": {
                "host": "localhost",
                "port": 9000,
                "version": "4.0.0 - Using both regression and classification models"
            }
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Sleep time prediction using both regression and classification models"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        features = data.get("features", [])
        if not features:
            return jsonify({"error": "No features provided. Expected: [WorkoutTime, ReadingTime, PhoneTime, WorkHours, CaffeineIntake, RelaxationTime]"}), 400
            
        result = make_prediction(regression_model, classification_model, features)
        if "error" in result:
            return jsonify(result), 400
        
        result["models_used"] = "Best Regression and Classification Models"
        result["model_info"] = "Using both regression model for sleep time prediction and classification model for sleep quality categorization"
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

if __name__ == '__main__':
    print("\n✨ Sleep Time Prediction Model Server")
    print("=" * 40)
    print("Models loaded: Best Regression and Classification Models")
    print("Available endpoints:")
    print("  - POST /predict")
    print("  - GET /health")
    print(f"\nStarting server on http://localhost:9000")
    print("Press Ctrl+C to stop the server")
    print("=" * 40)
    
    try:
        app.run(host='localhost', port=9000, debug=True)
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n\n❌ Server failed to start: {e}")
        sys.exit(1)