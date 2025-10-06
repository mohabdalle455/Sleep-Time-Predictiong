const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  workoutTime: { type: Number, required: true },
  readingTime: { type: Number, required: true },
  phoneTime: { type: Number, required: true },
  workHours: { type: Number, required: true },
  caffeineIntake: { type: Number, required: true },
  relaxationTime: { type: Number, required: true },

  prediction: { type: Number, required: true },  // Predicted sleep hours
  sleepQuality: { type: String, required: true }, // "Poor", "Normal", "Good"
  model: { type: String, required: true },       // e.g., 'linear_regression'
  accuracy: { type: String },                    // Optional
  recommendation: { type: String },              // AI-generated recommendation

}, { timestamps: true });

// Add indexes for better query performance
predictionSchema.index({ userId: 1 });
predictionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Prediction', predictionSchema);