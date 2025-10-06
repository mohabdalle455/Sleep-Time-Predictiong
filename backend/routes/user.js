const express = require("express");
const router = express.Router();
const { authenticateUser, auth, storage } = require("../middleware/authMiddleware");
const User = require("../models/User");
const predictionRoute = require("../models/Prediction");
const upload = require("../middleware/upload");

// PUT /api/profile/update
router.put("/update", auth, upload.single("profilePicture"), async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, phone } = req.body;

    const updateData = { username, email, phone };

    if (req.file) {
      updateData.profilePicture = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Profile update failed:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/profile (Requires token)
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// routes/userRoutes.js or userController.js
router.get("/total-users", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments(); // Replace 'User' with your model
    res.json({ total: totalUsers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch total users" });
  }
});
// routes/userRoutes.js or userController.js
router.get("/total-predictions", async (req, res) => {
  try {
    const predictions = await predictionRoute.countDocuments();
    console.log(predictions);
    res.json({ t_prediction: predictions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch total users" });
  }
});

router.get("/classified-predictions", async (req, res) => {
  try {
    const [riskCount, noRiskCount] = await Promise.all([
      predictionRoute.countDocuments({ prediction: 1 }),
      predictionRoute.countDocuments({ prediction: 0 }),
    ]);

    res.json({
      risk: riskCount,
      no_risk: noRiskCount,
      total: riskCount + noRiskCount,
    });

    // console.log("risk" + riskCount);
    // console.log("no risk" + noRiskCount);

  } catch (error) {
    console.error("Error in classified-predictions:", error);
    res.status(500).json({ error: "Failed to classify predictions" });
  }
});


router.get("/users", authenticateUser, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const users = await User.find().select("-password");
    res.status(200).json(users); // ✅ pure array
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});


// DELETE /api/users/:id
router.delete("/users/:id", authenticateUser, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to delete user" });
  }
});


// PUT /api/users/:id
router.put("/users/:id", authenticateUser, async (req, res) => {
  const { username, email, phone, role, status } = req.body;

  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, phone, role, status },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ msg: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ msg: "Failed to update user" });
  }
});

// GET /api/admin/profile
router.get("/admin/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("username profilePicture");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(401).json({ message: "Invalid token" });
  }
});




module.exports = router;
