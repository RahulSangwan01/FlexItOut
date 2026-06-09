const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  ingredients: [
    {
      name: String,
      quantity: String,
    },
  ],
  calories: { type: Number, required: true },
  category: { type: String, enum: ["Breakfast", "Lunch", "Dinner", "Snack"], required: true },
  imageUrl: { type: String, required: true },
});

module.exports = mongoose.model("Meal", mealSchema);