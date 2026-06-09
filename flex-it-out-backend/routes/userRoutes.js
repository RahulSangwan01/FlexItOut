const express = require("express");
const { getProfile, updateProfile } = require("../controllers/userController");
const authMiddleware = require("../Middleware/authMiddleware");
const { upload } = require("../Middleware/multer");
const { getUserData } = require("../controllers/getUserData");

const router = express.Router();

// Route to get user profile
router.get("/profile", authMiddleware, getProfile);

// Route to update user profile (with image upload)
router.put("/profile", authMiddleware, upload.single("profileImage"), updateProfile);

router.get("/:userId", getUserData);

module.exports = router;
