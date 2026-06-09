const express = require("express");
const { logActivity, getUserActivities } = require("../controllers/activityController");

const router = express.Router();

// Log user activity
router.post("/log", logActivity);

// Get user activities
router.get("/:userId", getUserActivities);

module.exports = router;