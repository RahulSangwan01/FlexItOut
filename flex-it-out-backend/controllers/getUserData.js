const User = require("../models/User"); // Assuming you have a User model

// Controller to fetch user data by userId
exports.getUserData = async (req, res) => {
  const { userId } = req.params; // Get userId from the request params

  try {
    // Find the user by their userId
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with the necessary data (e.g., streak and totalScore)
    res.json({
      streak: user.streak,
      score: user.score,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Server error" });
  }
};
