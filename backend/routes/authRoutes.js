const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const { register, login, verifyOTP, requestReset, verifyResetOTP, resetPassword, getAllUsers } = require("../controllers/authController");


const { protect, adminOnly } = require("../middleware/authMiddleware");


// Register (with profilePicture upload)
router.post("/register", upload.single("profilePicture"), register);

// Admin register user (with profilePicture upload)
router.post("/auth/register", protect, adminOnly, upload.single("profilePicture"), register);

// OTP verification
router.post("/verify-otp", verifyOTP);


// Login
router.post("/login", login);

router.post("/request-reset", requestReset);
router.post("/verifyResetOTP", verifyResetOTP);
router.post("/reset-password", resetPassword);

router.post("/verify-reset-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (user.otp !== otp) return res.status(400).json({ msg: "Invalid OTP" });

        if (Date.now() > user.otpExpiry) return res.status(400).json({ msg: "OTP expired" });

        user.otpVerified = true;
        await user.save();

        res.status(200).json({ msg: "OTP verified successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/all", protect, adminOnly, getAllUsers);

module.exports = router;
