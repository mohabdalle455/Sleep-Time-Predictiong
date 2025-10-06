import pandas as pd
import numpy as np
import os
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, accuracy_score, f1_score, confusion_matrix, classification_report

# Models
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor

print("=" * 60)
print("ENHANCED SLEEP TIME PREDICTION & CLASSIFICATION TRAINING")
print("=" * 60)

# 1. Load Dataset
dataset_path = "datasets/sleeptime_prediction_dataset.csv"
if not os.path.exists(dataset_path):
    raise FileNotFoundError(f"Dataset not found at {dataset_path}")

df = pd.read_csv(dataset_path)
print(f"Dataset shape: {df.shape}")

# 2. Basic Cleaning
df = df.drop_duplicates()
df = df.dropna()

# 3. Feature Engineering
df['TotalActivityTime'] = df[['WorkoutTime','ReadingTime','PhoneTime','WorkHours','RelaxationTime']].sum(axis=1)
RECOMMENDED_SLEEP = 8
df['SleepDeficit'] = RECOMMENDED_SLEEP - df['SleepTime']

# Classification target: Good / Normal / Bad
def categorize_sleep(hours):
    if hours < 6.5:
        return "Bad"
    elif 6.5 <= hours < 7.5:
        return "Normal"
    else:
        return "Good"

df['SleepCategory'] = df['SleepTime'].apply(categorize_sleep)

# Features and targets
feature_cols = ['WorkoutTime','ReadingTime','PhoneTime','WorkHours','CaffeineIntake','RelaxationTime','TotalActivityTime','SleepDeficit']
X = df[feature_cols]
y_reg = df['SleepTime']
y_clf = df['SleepCategory']

# Split data
X_train, X_test, y_reg_train, y_reg_test, y_clf_train, y_clf_test = train_test_split(X, y_reg, y_clf, test_size=0.2, random_state=42)

# 4. Regression Models
reg_models = {
    "LinearRegression": LinearRegression(),
    "Ridge": Ridge(alpha=1.0),
    "Lasso": Lasso(alpha=0.01),
    "RandomForest": RandomForestRegressor(n_estimators=200, random_state=42),
    "GradientBoosting": GradientBoostingRegressor(n_estimators=200, random_state=42),
    "SVR": SVR(kernel='rbf')
}

reg_results = []
for name, model in reg_models.items():
    pipe = Pipeline([("scaler", StandardScaler()), ("model", model)])
    pipe.fit(X_train, y_reg_train)
    y_pred = pipe.predict(X_test)

    mse = mean_squared_error(y_reg_test, y_pred)
    mae = mean_absolute_error(y_reg_test, y_pred)
    r2 = r2_score(y_reg_test, y_pred)

    reg_results.append({"Model": name, "R2": r2, "MAE": mae, "RMSE": np.sqrt(mse)})
    print(f"[Regression] {name}: R2={r2:.3f}, MAE={mae:.3f}, RMSE={np.sqrt(mse):.3f}")

# 5. Classification Model (RandomForest)
from sklearn.ensemble import RandomForestClassifier
clf_model = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", RandomForestClassifier(n_estimators=200, random_state=42))
])

clf_model.fit(X_train, y_clf_train)
y_clf_pred = clf_model.predict(X_test)

acc = accuracy_score(y_clf_test, y_clf_pred)
print("\n[Classification] RandomForest Accuracy:", acc)
print(classification_report(y_clf_test, y_clf_pred))

# 6. Save best models
models_dir = Path("models"); models_dir.mkdir(exist_ok=True)

best_reg_model = max(reg_results, key=lambda x: x['R2'])
print("\nBest Regression Model:", best_reg_model)

joblib.dump(reg_models[best_reg_model['Model']], models_dir / "best_regression_model.joblib")
joblib.dump(clf_model, models_dir / "best_classification_model.joblib")

print("Models saved in 'models/' directory.")