const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOTP = require("../utils/sendOTP");

exports.register = async (req, res) => {
    const { username, email, phone, password, role, resendOTP } = req.body;
    const profilePicture = req.file ? req.file.filename : null;
    const isAdminCreating = req.originalUrl.includes('/auth/register');
    
    // Validate phone number format (9 digits starting with 61)
    if (!/^61\d{9}$/.test(phone)) {
        return res.status(400).json({ msg: "Phone number must be 9 digits and start with 61." });
    }
    
    // Validate password length (minimum 6 characters)
    if (password.length < 6) {
        return res.status(400).json({ msg: "Password must be at least 6 characters long." });
    }

    try {
        // Check if this is a resend OTP request
        if (resendOTP) {
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ msg: "User not found. Please register first." });
            
            if (user.isVerified) return res.status(400).json({ msg: "Account already verified." });
            
            // Generate new OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
            
            // Update user with new OTP
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();
            
            // Send new OTP to user's email
            await sendOTP(email, otp, user.username);
            
            return res.status(200).json({ msg: "New OTP sent to your email." });
        }
        
        // Regular registration flow
        // Check if email already exists
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ msg: "Email already exists" });

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Generate OTP for regular users, not needed for admin-created users
        const otp = isAdminCreating ? null : Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = isAdminCreating ? null : Date.now() + 10 * 60 * 1000; // 10 minutes

        // Create user with OTP
        const user = await User.create({
            username,
            email,
            phone,
            password: hashed,
            role: isAdminCreating ? (role || 'user') : 'user', // Admin can set role, regular registration is always 'user'
            profilePicture,
            otp,
            otpExpiry,
            isVerified: isAdminCreating // Admin-created users are automatically verified
        });

        // Send OTP to user's email for regular registration
        if (!isAdminCreating) {
            await sendOTP(email, otp, username);
            return res.status(200).json({ msg: "Registration successful! Please check your email for OTP verification." });
        }

        // Response for admin-created users
        res.status(200).json({ 
            msg: "User created successfully by admin", 
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Server error" });
    }
};


exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Find user by email and OTP
        const user = await User.findOne({ email, otp });

        if (!user) {
            return res.status(400).json({ message: "Invalid OTP or user not found" });
        }

        if (Date.now() > user.otpExpiry) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // Determine the flow
        if (!user.isVerified) {
            // Registration flow
            user.isVerified = true;
        } else {
            // Password reset flow
            user.otpVerified = true;
        }

        // Clear OTP data
        user.otp = null;
        user.otpExpiry = null;

        await user.save();

        return res.status(200).json({
            message: "OTP verified successfully",
            email: user.email // this is useful for frontend to store
        });
    } catch (err) {
        console.error("OTP verification error:", err);
        return res.status(500).json({ error: "Server error during verification" });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (user.status === "inactive") {
            return res.status(403).json({ msg: "Your account is inactive. Please contact admin." });
        }


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        if (!user.isVerified) {
            return res.status(401).json({ msg: "Please verify your email" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                phone: user.phone,
                profilePicture: user.profilePicture
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// const bcrypt = require("bcryptjs");
// const User = require("../models/User");
// const { sendOTP } = require("../utils/sendEmail");

// 1. Request Reset
exports.requestReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
        user.otpVerified = false;
        await user.save();

        await sendOTP(email, otp);

        res.status(200).json({ msg: "OTP sent to your email" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Verify OTP
exports.verifyResetOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (String(user.otp).trim() !== String(otp).trim())
            return res.status(400).json({ msg: "Invalid OTP" });

        if (Date.now() > user.otpExpiry)
            return res.status(410).json({ msg: "OTP expired" });

        user.otpVerified = true;
        await user.save();

        res.status(200).json({ msg: "OTP verified" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// 3. Reset Password
exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });
        if (!user.otpVerified) return res.status(403).json({ msg: "OTP not verified" });

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.otp = null;
        user.otpExpiry = null;
        user.otpVerified = false;
        await user.save();

        res.status(200).json({ msg: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "email role status month").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) {
        console.error("Error fetching users:", err.message);
        res.status(500).json({ message: "Server error fetching users" });
    }
};