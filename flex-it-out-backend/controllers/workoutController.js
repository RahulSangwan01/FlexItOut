const Workout = require("../models/workout");
const User = require("../models/User");

exports.saveWorkout = async (req, res) => {
  const { userId, exercises, totalScore,streak } = req.body;
  console.log("Request body:", req.body); // Log incoming request

  try {
    const user = await User.findOne({ _id: userId });
    console.log("User found:", user); // Log user details

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newWorkout = new Workout({
      userId,
      exercises,
      totalScore,
      streak,
    });

    // Update user score
    user.score = (user.score || 0) + totalScore;
    user.streak=(user.streak|| 0) +1;
    await user.save();

    await newWorkout.save();
    console.log("Workout saved successfully!"); // Log success

    res.status(201).json({ message: "Workout saved successfully!", workout: newWorkout });
  } catch (error) {
    console.error("Error saving workout:", error); // Log full error details
    res.status(500).json({ message: "Error saving workout", error });
  }
};


// Get all workouts for a user
exports.getWorkouts = async (req, res) => {
  const { userId } = req.params;

  try {
    const workouts = await Workout.find({ userId });
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workouts", error });
  }
};
