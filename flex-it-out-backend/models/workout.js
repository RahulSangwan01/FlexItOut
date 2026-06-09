const mongoose = require("mongoose");

const WorkoutSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Unique user identifier
  exercises: [
    {
      exerciseId: { type: String, required: true }, // Exercise ID (e.g., "squat")
      exerciseName: { type: String, required: true }, // Exercise name (e.g., "Squats")
      reps: { type: Number, required: true }, // Number of reps completed
      score: { type: Number, required: true }, // Score earned
    },
  ],
  totalScore: { type: Number, required: true }, // Total score for the workout
  date: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model("Workout", WorkoutSchema);