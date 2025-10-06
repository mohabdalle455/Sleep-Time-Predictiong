# Sleep Time Prediction System - Startup Guide (Simplified)

This system now uses only the best performing model: **Linear Regression** for optimal accuracy and simplicity.

## Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (running locally or connection string)

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env file with your configuration
npm start
```

### 2. Model Server Setup (Simplified)
```bash
cd model
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Health Check Endpoints

- Backend: http://localhost:5000/api/model-health
- Model Server: http://localhost:9000/health
- Frontend: http://localhost:5173

## Important Notes

1. **Start Order**: Start MongoDB → Backend → Model Server → Frontend
2. **Model File**: Ensure `best_linear_regression_model.joblib` exists in `model/models/` directory
3. **Environment Variables**: Set GEMINI_API_KEY for AI recommendations
4. **Ports**: 
   - Frontend: 5173
   - Backend: 5000  
   - Model Server: 9000
   - MongoDB: 27017
5. **Simplified**: No model selection needed - automatically uses the best Linear Regression model

## Troubleshooting

### Model Server Won't Start
- Check if `best_linear_regression_model.joblib` exists in `model/models/`
- Verify Python dependencies are installed
- Check port 9000 is not in use

### Backend Can't Connect to Model Server
- Verify model server is running on port 9000
- Check `/api/model-health` endpoint
- System will use fallback predictions if model server is unavailable

### AI Recommendations Failing
- Set GEMINI_API_KEY environment variable
- System will use fallback recommendations if API fails

## System Architecture (Simplified)

```
Frontend (React) ←→ Backend (Node.js) ←→ Model Server (Python/Flask)
                         ↓                      ↓
                    MongoDB Database    Linear Regression Model
                         ↓                 (Best Performance)
                    Gemini AI API
```

## Key Improvements

- **Simplified Model Selection**: Automatically uses the best performing Linear Regression model
- **Reduced Complexity**: No need to choose between multiple models
- **Faster Loading**: Only one model loaded, reducing memory usage and startup time
- **Better User Experience**: Streamlined prediction interface
- **Maintained Accuracy**: Uses the model with highest accuracy (Linear Regression)