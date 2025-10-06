const express = require("express");
const router = express.Router();
const multer = require("multer");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/authMiddleware");
const sendOTP = require("../utils/sendOTP"); // Your email sender function
const path = require("path");
const fs = require("fs");

// ===== In-memory OTP storage =====
const otpStore = new Map(); // { email: { otp, expiresAt, updates } }

// ===== Multer config for file upload =====
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = "profile_" + Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });

// ===== [1] Request OTP when email is changed =====
router.post("/request-update-otp", async (req, res) => {
    const { email, updates } = req.body;

    if (!email || !updates) {
        return res.status(400).json({ message: "Email and updates are required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email, { otp, expiresAt, updates });

    try {
        await sendOTP(email, otp);
        res.status(200).json({ message: "OTP sent to new email" });
    } catch (err) {
        console.error("OTP sending error:", err);
        res.status(500).json({ message: "Failed to send OTP" });
    }
});

// ===== [2] Verify OTP and update profile if correct =====
router.post("/verify-update-otp", auth, async (req, res) => {
    const { otp } = req.body;

    if (!otp) return res.status(400).json({ message: "OTP is required" });

    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const entry = [...otpStore.entries()].find(([_, val]) => val.otp == otp);

        if (!entry) return res.status(400).json({ message: "Invalid OTP" });

        const [targetEmail, { expiresAt, updates }] = entry;
        if (Date.now() > expiresAt) return res.status(400).json({ message: "OTP expired" });

        user.email = targetEmail;
        user.username = updates.username;
        user.phone = updates.phone;

        if (updates.profilePicture) {
            user.profilePicture = updates.profilePicture;
        }

        await user.save();
        otpStore.delete(targetEmail);
        res.json({ message: "Profile updated after OTP verification" });
    } catch (err) {
        console.error("OTP verification error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ===== [3] Update profile directly (no OTP needed) =====
router.put("/update", auth, upload.single("profilePicture"), async (req, res) => {
    try {
        const { username, email, phone } = req.body;
        const userId = req.user.id;

        const updateData = { username, email, phone };

        if (req.file) {
            updateData.profilePicture = req.file.filename;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.json(updatedUser);
    } catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
