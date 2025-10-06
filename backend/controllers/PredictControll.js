const Prediction = require("../models/Prediction"); // updated model schema for sleep time
const generateRecommendation = require("../utils/recommender");
const axios = require("axios");
const { MODEL_API_URL } = require("../config/config");

// Function to determine sleep quality based on prediction hours
const getSleepQuality = (predictionHours) => {
  const hours = parseFloat(predictionHours);
  if (hours >= 7 && hours <= 9) {
    return "Good";
  } else if ((hours >= 6 && hours < 7) || (hours > 9 && hours <= 10)) {
    return "Normal";
  } else {
    return "Poor";
  }
};

const createPrediction = async (req, res) => {
  try {
    const {
      workoutTime,
      readingTime,
      phoneTime,
      workHours,
      caffeineIntake,
      relaxationTime,
      prediction,
      model,
      accuracy
    } = req.body;

    const userId = req.user.id;

    // Optional: convert prediction to readable hours
    const formattedPrediction = parseFloat(prediction).toFixed(2);
    
    // Calculate sleep quality based on prediction hours
    const sleepQuality = getSleepQuality(formattedPrediction);

    // Generate AI recommendation
    const recommendation = await generateRecommendation({
      workoutTime,
      readingTime,
      phoneTime,
      workHours,
      caffeineIntake,
      relaxationTime,
      prediction: formattedPrediction
    });

    const newPrediction = new Prediction({
      workoutTime,
      readingTime,
      phoneTime,
      workHours,
      caffeineIntake,
      relaxationTime,
      prediction: formattedPrediction,
      sleepQuality,
      model,
      accuracy,
      recommendation,
      userId: userId
    });

    const saved = await newPrediction.save();

    return res.status(201).json({
      message: "Successfully created a new prediction",
      data: { id: saved._id }
    });

  } catch (err) {
    console.error("❌ Sleep Prediction failed:", err);
    return res.status(500).json({ msg: "Prediction failed", error: err.message });
  }
};

const getAllPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find().sort({ createdAt: -1 });
    return res.status(200).json(predictions);
  } catch (err) {
    return res.status(500).json({ msg: "Failed to fetch predictions" });
  }
};

const getPredictionsByUser = async (req, res) => {
  try {
    // Use userId from params if available (for admin routes), otherwise use the authenticated user's id
    const userId = req.params.userId || req.user.id;
    const predictions = await Prediction.find({ userId: userId }).sort({ createdAt: -1 });
    res.status(200).json(predictions);
  } catch (err) {
    console.error("Prediction Fetch Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPredictionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prediction = await Prediction.findById(id);
    if (!prediction) {
      return res.status(404).json({ msg: "Prediction not found" });
    }
    return res.status(200).json(prediction);
  } catch (error) {
    console.error("Error fetching prediction:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// Make prediction using the ML model API
const makePrediction = async (req, res) => {
  // Enhanced mock prediction function with better logic
  const mockPrediction = (features) => {
    // Validate features first
    if (!Array.isArray(features) || features.length !== 6) {
      throw new Error("Invalid features array");
    }
    
    const [workoutTime, readingTime, phoneTime, workHours, caffeineIntake, relaxationTime] = features;
    
    // Calculate total activity time with a cap at 24 hours to prevent unrealistic scenarios
    const totalActivityTime = Math.min(24, workoutTime + readingTime + phoneTime + workHours + relaxationTime);
    
    // More sophisticated mock calculation that considers overlapping activities
    // Positive factors (increase sleep quality/time)
    const positiveFactors = (
      Math.min(workoutTime, 2) * 0.4 +  // Exercise helps, but too much can hurt
      Math.min(readingTime, 3) * 0.3 +   // Reading before bed helps
      Math.min(relaxationTime, 4) * 0.5  // Relaxation is very beneficial
    );
    
    // Negative factors (decrease sleep quality/time)
    const negativeFactors = (
      Math.min(phoneTime, 10) * 0.15 +     // Screen time hurts sleep
      Math.max(0, workHours - 8) * 0.2 +   // Overwork affects sleep
      Math.min(caffeineIntake, 1000) * 0.0008  // Caffeine impact (scaled)
    );
    
    // Adjust for total activity time - if it's close to 24 hours, sleep time must be reduced
    const timePressure = Math.max(0, (totalActivityTime - 16) * 0.3);
    
    // Base sleep time with natural variation
    const baseSleep = 7.5 + (Math.random() - 0.5) * 0.5; // 7.25-7.75 base
    
    // Calculate final prediction (between 4 and 12 hours)
    const rawPrediction = baseSleep + positiveFactors - negativeFactors - timePressure;
    const prediction = Math.max(4, Math.min(12, rawPrediction));
    
    return prediction;
  };
  
  // Check model server health first
  const checkModelServerHealth = async () => {
    try {
      const healthResponse = await axios.get(`${MODEL_API_URL}/health`, {
        timeout: 3000 // 3 second timeout
      });
      return healthResponse.data.status === 'healthy';
    } catch (error) {
      console.log('Model server health check failed:', error.message);
      return false;
    }
  };
  
  try {
    console.log('Received prediction request:', req.body);
    const { model, features } = req.body;
    
    // Enhanced input validation
    if (!model || typeof model !== 'string') {
      return res.status(400).json({ 
        error: "Invalid model parameter. Must be a string." 
      });
    }
    
    if (!features || !Array.isArray(features) || features.length !== 6) {
      return res.status(400).json({ 
        error: "Invalid features. Must be an array with exactly 6 numeric values." 
      });
    }
    
    // Validate each feature is a number
    for (let i = 0; i < features.length; i++) {
      if (typeof features[i] !== 'number' || isNaN(features[i]) || features[i] < 0) {
        return res.status(400).json({
          error: `Feature ${i + 1} must be a non-negative number. Received: ${features[i]}`
        });
      }
    }
    
    const validModels = ['linear_regression'];
    if (!validModels.includes(model)) {
      return res.status(400).json({
        error: `Invalid model '${model}'. Only 'linear_regression' is supported as it's the best performing model.`
      });
    }

    console.log(`Making request to model API: ${MODEL_API_URL}/predict`);
    console.log('Features:', features);
    
    // Check if model server is healthy
    const isHealthy = await checkModelServerHealth();
    if (!isHealthy) {
      console.log('Model server unhealthy, using enhanced mock prediction');
      
      const mockPredictionValue = mockPrediction(features);
      console.log('Enhanced mock prediction value:', mockPredictionValue);
      
      // Generate recommendation using mock prediction
      const recommendation = await generateRecommendation({
        workoutTime: features[0],
        readingTime: features[1],
        phoneTime: features[2],
        workHours: features[3],
        caffeineIntake: features[4],
        relaxationTime: features[5],
        prediction: mockPredictionValue.toFixed(2)
      });
      
      return res.status(200).json({
        prediction: mockPredictionValue.toFixed(2),
        recommendation,
        model: model + ' (mock - server unavailable)',
        accuracy: 'N/A (mock prediction)',
        data: {
          workoutTime: features[0],
          readingTime: features[1],
          phoneTime: features[2],
          workHours: features[3],
          caffeineIntake: features[4],
          relaxationTime: features[5]
        },
        note: 'Model server unavailable, using enhanced fallback prediction'
      });
    }
    
    // Call the model API with timeout and better error handling
    try {
      const modelResponse = await axios.post(
        `${MODEL_API_URL}/predict`,
        { features },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('Model API response status:', modelResponse.status);
      console.log('Model API response data:', modelResponse.data);

      if (modelResponse.data.error) {
        console.log('Model API returned error:', modelResponse.data.error);
        return res.status(400).json({ 
          error: `Model prediction failed: ${modelResponse.data.error}` 
        });
      }

      // Validate response structure - now expecting an object with prediction as a number
      if (!modelResponse.data.prediction || typeof modelResponse.data.prediction !== 'number') {
        console.log('Invalid model response structure:', modelResponse.data);
        return res.status(500).json({
          error: "Invalid response from model server - expected prediction as number"
        });
      }

      // Extract the prediction value (now it's directly a number)
      const prediction = modelResponse.data.prediction;
      
      if (typeof prediction !== 'number' || isNaN(prediction)) {
        console.log('Invalid prediction value:', prediction);
        return res.status(500).json({
          error: "Model returned invalid prediction value"
        });
      }
      
      console.log('Extracted prediction:', prediction);
    
      // Add a small delay before generating recommendation to ensure API is ready
      console.log('Waiting briefly before generating recommendation...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate recommendation
      console.log('Starting recommendation generation...');
      const recommendation = await generateRecommendation({
        workoutTime: features[0],
        readingTime: features[1],
        phoneTime: features[2],
        workHours: features[3],
        caffeineIntake: features[4],
        relaxationTime: features[5],
        prediction: prediction.toFixed(2)
      });
      console.log('Recommendation generation completed');

      // Return the prediction and recommendation with enhanced data
      return res.status(200).json({
        prediction: prediction.toFixed(2),
        recommendation,
        model: modelResponse.data.model_used || model,
        accuracy: "Model-based prediction",
        ai_recommended_sleep: modelResponse.data.ai_recommended_sleep,
        sleep_quality: modelResponse.data.sleep_quality,
        quality_score: modelResponse.data.quality_score,
        health_insights: modelResponse.data.health_insights,
        was_constrained: modelResponse.data.was_constrained,
        data: {
          workoutTime: features[0],
          readingTime: features[1],
          phoneTime: features[2],
          workHours: features[3],
          caffeineIntake: features[4],
          relaxationTime: features[5]
        }
      });
  } catch (axiosError) {
      console.error('Axios request failed:', axiosError.message);
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', axiosError.response.data);
        console.error('Response status:', axiosError.response.status);
        console.error('Response headers:', axiosError.response.headers);
        return res.status(500).json({
          error: 'Model API request failed',
          status: axiosError.response.status,
          data: axiosError.response.data
        });
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error('No response received from model API');
        console.log('Using mock prediction as fallback');
        
        // Use mock prediction as fallback
        const mockPredictionValue = mockPrediction(features);
        console.log('Mock prediction value:', mockPredictionValue);
        
        // Add a small delay before generating recommendation to ensure API is ready
        console.log('Waiting briefly before generating recommendation for mock prediction...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate recommendation using mock prediction
        console.log('Starting recommendation generation for mock prediction...');
        const recommendation = await generateRecommendation({
          workoutTime: features[0],
          readingTime: features[1],
          phoneTime: features[2],
          workHours: features[3],
          caffeineIntake: features[4],
          relaxationTime: features[5],
          prediction: mockPredictionValue.toFixed(2)
        });
        console.log('Mock recommendation generation completed');
        
        // Return the mock prediction and recommendation
        return res.status(200).json({
          prediction: mockPredictionValue.toFixed(2),
          recommendation,
          model: model + ' (mock)',
          accuracy: 'N/A (mock prediction)',
          data: {
            workoutTime: features[0],
            readingTime: features[1],
            phoneTime: features[2],
            workHours: features[3],
            caffeineIntake: features[4],
            relaxationTime: features[5]
          },
          note: 'Using mock prediction as model server is not available'
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', axiosError.message);
        return res.status(500).json({
          error: 'Failed to set up model API request',
          message: axiosError.message
        });
      }
    }
  } catch (err) {
    console.error("Prediction API Error:", err);
    return res.status(500).json({ 
      error: "Failed to make prediction", 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

module.exports = {
  createPrediction,
  getAllPredictions,
  getPredictionsByUser,
  getPredictionById,
  makePrediction
};
