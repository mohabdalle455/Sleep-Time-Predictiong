import joblib
import numpy as np
import os

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Define the model paths
regression_model_path = os.path.join(current_dir, "models/best_regression_model.joblib")
classification_model_path = os.path.join(current_dir, "models/best_classification_model.joblib")

print("Testing model loading...")

# Check if files exist
if os.path.exists(regression_model_path):
    print("✅ Regression model file exists")
else:
    print("❌ Regression model file not found")

if os.path.exists(classification_model_path):
    print("✅ Classification model file exists")
else:
    print("❌ Classification model file not found")

# Try to load the models
try:
    regression_model = joblib.load(regression_model_path)
    print("✅ Successfully loaded regression model")
except Exception as e:
    print(f"❌ Failed to load regression model: {e}")

try:
    classification_model = joblib.load(classification_model_path)
    print("✅ Successfully loaded classification model")
except Exception as e:
    print(f"❌ Failed to load classification model: {e}")

# Test prediction with sample data
print("\nTesting prediction with sample data...")
try:
    # Sample features: [WorkoutTime, ReadingTime, PhoneTime, WorkHours, CaffeineIntake, RelaxationTime]
    sample_features = [1.5, 0.5, 2.0, 8.0, 150.0, 1.0]
    
    # Prepare features as done in training
    workout_time, reading_time, phone_time, work_hours, caffeine_intake, relaxation_time = sample_features
    total_activity_time = sum(sample_features)
    sleep_deficit = 8.0 - 7.0  # Placeholder
    
    # Features in the order used during training
    model_features = [
        workout_time,
        reading_time,
        phone_time,
        work_hours,
        caffeine_intake,
        relaxation_time,
        total_activity_time,
        sleep_deficit
    ]
    
    # Make prediction
    features_array = np.array(model_features).reshape(1, -1)
    regression_prediction = regression_model.predict(features_array)[0]
    classification_prediction = classification_model.predict(features_array)[0]
    
    print(f"✅ Regression prediction: {regression_prediction:.2f}")
    print(f"✅ Classification prediction: {classification_prediction}")
    print("✅ All tests passed!")
    
except Exception as e:
    print(f"❌ Prediction test failed: {e}")