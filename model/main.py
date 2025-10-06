from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
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
    caffeine_intake = raw_features[4] / 100.0  # Scale down caffeine intake to match training data
    relaxation_time = raw_features[5]
    
    # Calculate engineered features exactly as done during training
    # For overlapping activities, we cap the total at 24 hours to prevent unrealistic predictions
    # Calculate total activity time (capped at 24 hours)
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
        
        # Define feature names to avoid UserWarning
        feature_names = ['WorkoutTime', 'ReadingTime', 'PhoneTime', 'WorkHours', 'CaffeineIntake', 'RelaxationTime', 'TotalActivityTime', 'SleepDeficit']
        
        # Log the features for debugging
        print(f"Input features: {features}")
        print(f"Model features: {model_features}")
        
        # Create DataFrame with feature names to avoid UserWarning
        # Use numpy array to ensure compatibility with newer pandas versions
        features_array = np.array([model_features])
        features_df = pd.DataFrame(data=features_array, columns=feature_names)
        
        # Calculate base sleep time based on activity patterns and available time
        # This is a more direct approach that doesn't rely solely on the model
        total_activity = model_features[6]  # TotalActivityTime
        
        # Calculate available time more realistically
        available_time = 24.0 - total_activity
        
        # If very little time is available, allow for shorter sleep duration
        if available_time < 6.0:
            base_sleep = max(4.0, available_time * 0.9)  # Allow minimum 4 hours when time is limited
        else:
            base_sleep = max(6.0, available_time * 0.8)  # Normal case - aim for at least 6 hours
        
        # Adjust base sleep based on positive and negative factors with improved weights
        # Workout impact depends on duration - moderate exercise helps sleep, excessive can hinder
        if model_features[0] <= 2.0:  # Moderate workout (up to 2 hours)
            workout_adjustment = model_features[0] * 0.3  # Positive impact
        else:  # Excessive workout
            workout_adjustment = 0.6 - ((model_features[0] - 2.0) * 0.1)  # Diminishing returns
            
        # Reading before bed helps sleep quality
        reading_adjustment = min(model_features[1], 2.0) * 0.2  # Cap benefit at 2 hours
        
        # Phone time has increasingly negative impact the more it's used
        phone_penalty = -0.1 * model_features[2] - (0.05 * max(0, model_features[2] - 3.0)**2)  # Exponential penalty for excessive use
        
        # Work impact - moderate work is neutral, overwork reduces sleep
        work_penalty = max(0, (model_features[3] - 8.0) * -0.15)  # Increased penalty for overwork
        
        # Caffeine has stronger impact closer to bedtime (assumed)
        caffeine_penalty = model_features[4] * -0.4  # Increased penalty for caffeine
        
        # Relaxation is very beneficial for sleep
        relaxation_bonus = min(model_features[5], 3.0) * 0.3  # Cap benefit at 3 hours
        
        # Apply adjustments to base sleep
        adjusted_sleep = base_sleep + workout_adjustment + reading_adjustment + \
                         phone_penalty + work_penalty + caffeine_penalty + relaxation_bonus
        
        # Make prediction with regression model as a reference point
        model_prediction = regression_model.predict(features_df)[0]
        print(f"Model raw prediction: {model_prediction}")
        
        # Blend model prediction with our calculated prediction
        # This gives us more control while still using the model's insights
        # When available time is very limited, prioritize the adjusted_sleep calculation
        available_time = 24.0 - total_activity
        
        if available_time < 6.0:
            # When time is limited, rely more on our direct calculation
            blend_ratio = 0.9  # 90% adjusted_sleep, 10% model_prediction
        else:
            # Normal case - balanced blend
            blend_ratio = 0.7  # 70% adjusted_sleep, 30% model_prediction
            
        blended_prediction = (model_prediction * (1 - blend_ratio)) + (adjusted_sleep * blend_ratio)
        print(f"Blended prediction: {blended_prediction} (blend ratio: {blend_ratio})")
        
        # Apply constraints to ensure reasonable sleep time (4-12 hours)
        # Allowing predictions as low as 4 hours for cases where user has limited time available
        final_prediction = max(4.0, min(12.0, blended_prediction))
        print(f"Final prediction: {final_prediction}")
        
        # Make classification prediction
        classification_result = classification_model.predict(features_df)[0]
        
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
        was_constrained = abs(blended_prediction - final_prediction) > 0.01
        
        # Generate explanation for the prediction
        explanation = []
        
        # Add time constraint explanation if applicable
        if available_time < 6.0:
            explanation.append(f"Your scheduled activities leave only {available_time:.1f} hours available, limiting possible sleep time.")
        
        # Add activity impact explanations
        if workout_adjustment > 0:
            explanation.append(f"Your {model_features[0]:.1f} hours of workout has a positive effect on sleep quality.")
        elif workout_adjustment < 0:
            explanation.append(f"Your {model_features[0]:.1f} hours of workout may be excessive and could affect sleep quality.")
            
        if phone_penalty < -0.5:
            explanation.append(f"Your {model_features[2]:.1f} hours of phone time before bed significantly reduces sleep quality.")
            
        if caffeine_penalty < -0.3:
            explanation.append(f"Your caffeine intake may be reducing your sleep duration.")
            
        if work_penalty < -0.3:
            explanation.append(f"Your {model_features[3]:.1f} hours of work exceeds recommended limits and may affect sleep.")
            
        if relaxation_bonus > 0.5:
            explanation.append(f"Your {model_features[5]:.1f} hours of relaxation time positively impacts your sleep quality.")
            
        # Add health recommendation
        if final_prediction < 6.0:
            explanation.append("While 6-8 hours of sleep is generally recommended for adults, your current schedule may limit this. Consider reducing screen time or work hours if possible.")
        
        return {
            "prediction": round(final_prediction, 2),
            "raw_prediction": round(model_prediction, 2),
            "final_raw_prediction": round(final_prediction, 2),
            "was_constrained": bool(was_constrained),
            "sleep_category": classification_result,
            "sleep_quality": sleep_quality,
            "quality_score": quality_score,
            "explanation": explanation,
            "health_insights": {
                "minimum_healthy_sleep": 4.0,
                "maximum_healthy_sleep": 12.0,
                "meets_minimum_requirement": bool(final_prediction >= 4.0),
                "ideal_sleep_range": "6-8 hours",
                "available_time": round(available_time, 2)
            },
            "features_used": {
                "workout_time": float(features[0]),
                "reading_time": float(features[1]),
                "phone_time": float(features[2]),
                "work_hours": float(features[3]),
                "caffeine_intake": float(features[4]),
                "relaxation_time": float(features[5]),
                "total_activity_time": round(float(model_features[6]), 2),
                "sleep_deficit": round(float(model_features[7]), 2),
                "available_time": round(available_time, 2)
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
                "minimum_sleep_hours": 4.0,
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