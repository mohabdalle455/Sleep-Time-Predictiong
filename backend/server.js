const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/user');
const predictionRoute = require('./routes/predictionRoute');
const ReportRouter = require('./routes/reportRoute');
const updateProfileRouter = require("./routes/updateProfileRouter");
const loginOtpVerfiy = require("./routes/loginOtpVerfiy");

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // ✅ Frontend origin
  credentials: true                // ✅ Allow cookies/tokens
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/recommendation', predictionRoute); //recommandarion link 
app.use("/api/", profileRoutes);
app.use("/api/profileUpdate/", updateProfileRouter);
app.use("/api/login-otp/", loginOtpVerfiy);

app.use('/api/report', ReportRouter);

// Add the predict endpoint
const { makePrediction } = require('./controllers/PredictControll');
app.post('/api/predict', makePrediction);

// Add model server health check endpoint
app.get('/api/model-health', async (req, res) => {
  try {
    const axios = require('axios');
    const { MODEL_API_URL } = require('./config/config');
    
    const healthResponse = await axios.get(`${MODEL_API_URL}/health`, {
      timeout: 5000
    });
    
    res.json({
      status: 'healthy',
      model_server: healthResponse.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      model_server_url: process.env.MODEL_API_URL || 'http://localhost:9000',
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));