const express = require("express");
const router = express.Router();
const workoutController = require("../controllers/workoutController");

// Save a completed workout
router.post("/save", workoutController.saveWorkout);

// Get all workouts for a user
router.get("/:userId", workoutController.getWorkouts);

module.exports = router;