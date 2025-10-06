const express = require("express");
const router = express.Router();
const Prediction = require("../models/Prediction");
const User = require("../models/User");

// 🔹 GET Daily and Monthly Overview
router.get("/overview", async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const dailyPredictions = await Prediction.countDocuments({ createdAt: { $gte: today } });
        const monthlyPredictions = await Prediction.countDocuments({ createdAt: { $gte: monthStart } });

        const dailyUsers = await User.countDocuments({ createdAt: { $gte: today } });
        const monthlyUsers = await User.countDocuments({ createdAt: { $gte: monthStart } });

        res.json({
            dailyPredictions,
            monthlyPredictions,
            dailyUsers,
            monthlyUsers,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to get overview" });
    }
});

// 🔹 GET Daily Prediction Report (sorted by newest first)
router.get("/predictions/daily", async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const predictions = await Prediction.find({ createdAt: { $gte: today } })
            .populate("userId", "username email")
            .sort({ createdAt: -1 }); // Sort by newest first
        res.json(predictions);
    } catch (error) {
        console.error("Error fetching daily predictions:", error);
        res.status(500).json({ error: "Failed to fetch daily predictions" });
    }
});

// 🔹 GET Monthly Prediction Report (sorted by newest first)
router.get("/predictions/monthly", async (req, res) => {
    try {
        const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const predictions = await Prediction.find({ createdAt: { $gte: firstDay } })
            .populate("userId", "username email")
            .sort({ createdAt: -1 }); // Sort by newest first
        res.json(predictions);
    } catch (error) {
        console.error("Error fetching monthly predictions:", error);
        res.status(500).json({ error: "Failed to fetch monthly predictions" });
    }
});

module.exports = router;