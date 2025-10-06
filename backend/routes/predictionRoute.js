const express = require("express");
const router = express.Router();

const {
  createPrediction,
  getAllPredictions,
  getPredictionsByUser,
  getPredictionById
} = require("../controllers/PredictControll");

const { authenticateUser } = require("../middleware/authMiddleware");
const Prediction = require("../models/Prediction");

// Create prediction
router.post("/", authenticateUser, createPrediction);

// Get all predictions (sorted by newest first)
router.get("/all", authenticateUser, async (req, res) => {
  try {
    const predictions = await Prediction.find().sort({ createdAt: -1 });
    return res.status(200).json(predictions);
  } catch (err) {
    return res.status(500).json({ msg: "Failed to fetch predictions" });
  }
});

// Base route for all predictions (for DashboardDescription.jsx) (sorted by newest first)
router.get("/", authenticateUser, async (req, res) => {
  try {
    const predictions = await Prediction.find().sort({ createdAt: -1 });
    return res.status(200).json(predictions);
  } catch (err) {
    return res.status(500).json({ msg: "Failed to fetch predictions" });
  }
});

// Get predictions by user ID (admin) (sorted by newest first)
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const predictions = await Prediction.find({ userId: userId }).sort({ createdAt: -1 });
    res.status(200).json(predictions);
  } catch (err) {
    console.error("Prediction Fetch Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get predictions for logged-in user (sorted by newest first)
router.get("/me", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const predictions = await Prediction.find({ userId: userId }).sort({ createdAt: -1 });
    res.status(200).json(predictions);
  } catch (err) {
    console.error("Prediction Fetch Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📊 Sleep Prediction STATS
router.get("/stats", authenticateUser, async (req, res) => {
  try {
    const all = await Prediction.find().sort({ createdAt: -1 }); // Sort by newest first

    const stats = {
      total: all.length,
      avgSleepTime: (all.reduce((acc, p) => acc + p.prediction, 0) / all.length).toFixed(2),
      avgWorkoutTime: (all.reduce((acc, p) => acc + p.workoutTime, 0) / all.length).toFixed(2),
      avgReadingTime: (all.reduce((acc, p) => acc + p.readingTime, 0) / all.length).toFixed(2),
      avgPhoneTime: (all.reduce((acc, p) => acc + p.phoneTime, 0) / all.length).toFixed(2),
      avgWorkHours: (all.reduce((acc, p) => acc + p.workHours, 0) / all.length).toFixed(2),
      avgCaffeine: (all.reduce((acc, p) => acc + p.caffeineIntake, 0) / all.length).toFixed(2),
      avgRelaxTime: (all.reduce((acc, p) => acc + p.relaxationTime, 0) / all.length).toFixed(2),
      // Sleep quality distribution
      poorSleep: all.filter(p => {
        const quality = p.sleepQuality || (p.prediction < 6 ? 'Poor' : p.prediction < 7 ? 'Normal' : 'Good');
        return quality === 'Poor';
      }).length,
      normalSleep: all.filter(p => {
        const quality = p.sleepQuality || (p.prediction < 6 ? 'Poor' : p.prediction < 7 ? 'Normal' : 'Good');
        return quality === 'Normal';
      }).length,
      goodSleep: all.filter(p => {
        const quality = p.sleepQuality || (p.prediction < 6 ? 'Poor' : p.prediction < 7 ? 'Normal' : 'Good');
        return quality === 'Good';
      }).length,
      // Legacy stats for backward compatibility
      below6Hours: all.filter(p => p.prediction < 6).length,
      above6Hours: all.filter(p => p.prediction >= 6).length
    };

    res.json(stats);
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to fetch prediction statistics" });
  }
});

// Get single prediction
router.get("/:id", getPredictionById);

module.exports = router;