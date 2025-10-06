import joblib
import numpy as np
import pandas as pd

print("Loading regression model...")
model = joblib.load('models/best_regression_model.joblib')
print('Model type:', type(model))

# Define feature names to avoid UserWarning
feature_names = ['WorkoutTime', 'ReadingTime', 'PhoneTime', 'WorkHours', 'CaffeineIntake', 'RelaxationTime', 'TotalActivityTime', 'SleepDeficit']

# Test with various feature combinations - Raw input features as they would come from frontend
raw_features = [
    # Format: [WorkoutTime, ReadingTime, PhoneTime, WorkHours, CaffeineIntake, RelaxationTime]
    [1.0, 1.0, 1.0, 8.0, 100.0, 1.0],  # Balanced lifestyle
    [2.0, 0.5, 2.0, 6.0, 150.0, 0.5],  # More workout, less relaxation
    [0.5, 2.0, 3.0, 9.0, 200.0, 1.5],  # High work hours, high phone time
    [3.0, 0.1, 0.5, 4.0, 50.0, 2.0],    # High workout, low screen time
    [0.1, 0.1, 5.0, 10.0, 300.0, 0.1]   # High stress scenario
]

# Function to prepare features (same as in main.py)
def prepare_features(raw_input):
    # Extract individual features
    workout_time = raw_input[0]
    reading_time = raw_input[1]
    phone_time = raw_input[2]
    work_hours = raw_input[3]
    caffeine_intake = raw_input[4] / 100.0  # Scale down caffeine intake to match training data
    relaxation_time = raw_input[5]
    
    # Calculate total activity time (capped at 24 hours)
    total_activity_time = min(24.0, workout_time + reading_time + phone_time + work_hours + relaxation_time)
    
    # Initial sleep deficit (placeholder, will be updated during prediction)
    sleep_deficit = 0.0
    
    # Return the 8 features used by the model
    return [workout_time, reading_time, phone_time, work_hours, 
            caffeine_intake, relaxation_time, total_activity_time, sleep_deficit]

print("\nTesting model with different feature combinations:")
print("-" * 80)

for i, raw in enumerate(raw_features):
    print(f'Test {i+1} raw features: {raw}')
    
    # Transform features
    model_features = prepare_features(raw)
    print(f"Model features: {model_features}")
    
    # Create DataFrame with feature names
    features_df = pd.DataFrame([model_features], columns=feature_names)
    
    # Calculate base sleep time based on activity patterns
    total_activity = model_features[6]  # TotalActivityTime
    base_sleep = max(7.0, 24.0 - (total_activity * 0.7))  # Ensure at least 7 hours base sleep
    print(f"Base sleep: {base_sleep} hours")
    
    # Adjust base sleep based on positive and negative factors
    workout_adjustment = model_features[0] * 0.2  # Workout is positive for sleep
    reading_adjustment = model_features[1] * 0.1  # Reading is positive for sleep
    phone_penalty = model_features[2] * -0.15  # Phone time reduces sleep
    work_penalty = max(0, (model_features[3] - 8.0) * -0.1)  # Work beyond 8 hours reduces sleep
    caffeine_penalty = model_features[4] * -0.3  # Caffeine reduces sleep
    relaxation_bonus = model_features[5] * 0.2  # Relaxation improves sleep
    
    print(f"Adjustments: Workout +{workout_adjustment}, Reading +{reading_adjustment}, Phone {phone_penalty}, ")
    print(f"             Work {work_penalty}, Caffeine {caffeine_penalty}, Relaxation +{relaxation_bonus}")
    
    # Apply adjustments to base sleep
    adjusted_sleep = base_sleep + workout_adjustment + reading_adjustment + \
                     phone_penalty + work_penalty + caffeine_penalty + relaxation_bonus
    print(f"Adjusted sleep: {adjusted_sleep} hours")
    
    # Make prediction with regression model as a reference point
    model_prediction = model.predict(features_df)[0]
    print(f"Model raw prediction: {model_prediction} hours")
    
    # Blend model prediction with our calculated prediction
    blended_prediction = (model_prediction * 0.3) + (adjusted_sleep * 0.7)
    print(f"Blended prediction: {blended_prediction} hours")
    
    # Apply constraints to ensure reasonable sleep time (6-12 hours)
    final_prediction = max(6.0, min(12.0, blended_prediction))
    print(f"Final prediction: {final_prediction} hours")
    print("-" * 80)