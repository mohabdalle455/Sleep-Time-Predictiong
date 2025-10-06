const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendOTP = require("../utils/sendOTP");

const otpStore = new Map(); // In-memory store for OTPs

router.post("/login-otp", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        // const isMatch = password === user.password; // If using bcrypt: await bcrypt.compare(password, user.password)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

        // if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });


        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiresAt = Date.now() + 5 * 60 * 1000;

        otpStore.set(email, { otp, expiresAt });
        await sendOTP(email, otp);

        res.json({ message: "OTP sent to email" });
    } catch (err) {
        console.error("Login OTP error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

// POST /api/auth/verify-login-otp
router.post("/verify-login-otp", async (req, res) => {
    const { email, otp } = req.body;

    const record = otpStore.get(email);
    if (!record) return res.status(400).json({ msg: "No OTP found" });

    if (Date.now() > record.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({ msg: "OTP expired" });
    }

    if (parseInt(otp) !== record.otp) {
        return res.status(400).json({ msg: "Invalid OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });

    otpStore.delete(email);
    res.json({
        message: "OTP verified, login successful",
        token,
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
        },
    });
});

module.exports = router;
