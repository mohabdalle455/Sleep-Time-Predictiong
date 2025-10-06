const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  password: { type: String, required: true },
  profilePicture: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  otpVerified: { type: Boolean, default: false }  
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
