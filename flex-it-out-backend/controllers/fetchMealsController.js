const Meal = require("../models/Meal");

const getMeals = async (req, res) => {
  try {
    const meals = await Meal.find(); // Fetch all meals
    res.status(200).json(meals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getMeals }; // ✅ Ensure this is correct
