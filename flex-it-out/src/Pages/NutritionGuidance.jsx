import React, { useState, useEffect, useContext } from "react";
import CalorieCalculator from "../Components/CalorieCalculator";
import axios from "axios";
import "./NutritionGuidance.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, MenuItem } from "@mui/material";

const API_URL =
  import.meta.env.VITE_API_URL_PRODUCTION && import.meta.env.VITE_API_URL_TESTING
    ? (import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL_PRODUCTION
      : import.meta.env.VITE_API_URL_TESTING)
    : "http://localhost:5001";

const NutritionGuidance = () => {
  const [meals, setMeals] = useState([]);
  const [dailyMeals, setDailyMeals] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();
  const { userId, membership } = useContext(AuthContext);

  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState("Breakfast");
  const [mealCalories, setMealCalories] = useState("");

  useEffect(() => {
    if (membership !== "premium") {
      setOpenDialog(true);
      return;
    }

    const fetchMeals = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`${API_URL}/api/meals/getmeals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeals(response.data);
      } catch (error) {
        setError("Failed to fetch meals");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [navigate, userId, membership]);

  const showMeal = (meal) => {
    navigate(`/meal/${meal._id}`, { state: { meal } });
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    navigate("/pricing");
  };

  const addDailyMeal = () => {
    if (!mealName || !mealCalories) return;
    const newMeal = {
      name: mealName,
      type: mealType,
      calories: parseInt(mealCalories),
      time: new Date().toLocaleTimeString(),
    };

    const updatedMeals = [...dailyMeals, newMeal];
    setDailyMeals(updatedMeals);

    // Update total calories
    setTotalCalories(updatedMeals.reduce((acc, meal) => acc + meal.calories, 0));

    setMealName("");
    setMealCalories("");
  };

  // Function to suggest exercises based on exceeded calories
  const suggestExercises = (exceededCalories) => {
    if (exceededCalories <= 0) return [];

    const exercises = [
      { name: "Jogging", burnRate: 300 }, // Calories burned per 30 mins
      { name: "Cycling", burnRate: 250 },
      { name: "Jump Rope", burnRate: 200 },
      { name: "Push-ups", burnRate: 100 },
      { name: "Squats", burnRate: 150 },
      { name: "Burpees", burnRate: 180 },
    ];

    let remainingCalories = exceededCalories;
    const suggested = [];

    for (let i = 0; i < exercises.length && remainingCalories > 0; i++) {
      if (remainingCalories >= exercises[i].burnRate) {
        suggested.push(`${exercises[i].name} for 30 mins`);
        remainingCalories -= exercises[i].burnRate;
      }
    }

    return suggested;
  };

  const exceededCalories = totalCalories - (calorieGoal ? parseInt(calorieGoal) : 0);
  const exerciseSuggestions = suggestExercises(exceededCalories);

  return (
    <div className="nutrition-container">
      <CalorieCalculator />

      <div className="daily-meal-tracker">
        <h2>Daily Meal Tracker 🍽️</h2>

        <TextField
          label="Calorie Goal"
          type="number"
          variant="outlined"
          value={calorieGoal}
          onChange={(e) => setCalorieGoal(e.target.value)}
          placeholder="Enter your daily calorie goal"
        />

        <TextField
          label="Meal Name"
          variant="outlined"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
        />
        <TextField
          select
          label="Meal Type"
          variant="outlined"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
        >
          {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Calories"
          type="number"
          variant="outlined"
          value={mealCalories}
          onChange={(e) => setMealCalories(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={addDailyMeal}>
          Add Meal
        </Button>

        {dailyMeals.length > 0 && (
          <div className="daily-meal-list">
            <h3>Your Daily Meals</h3>
            <ul>
              {dailyMeals.map((meal, index) => (
                <li key={index}>{meal.time} - {meal.type}: {meal.name} ({meal.calories} kcal)</li>
              ))}
            </ul>
            <h3>Total Calories: {totalCalories} kcal</h3>
          </div>
        )}

        {calorieGoal && totalCalories > calorieGoal && (
          <div className="exceeded-calories">
            <h3 style={{ color: "red" }}>You've exceeded your calorie goal by {exceededCalories} kcal! 😱</h3>
            <h4>Suggested Exercises to Burn Excess Calories:</h4>
            <ul>
              {exerciseSuggestions.map((exercise, index) => (
                <li key={index}>{exercise}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="meals-section">
        <h2 className="section-title">Healthy Meal Plans 🍽️</h2>

        {loading ? (
          <p className="loading">Loading meals...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="meal-grid">
            {meals.map((meal) => (
              <div key={meal._id} className="meal-card" onClick={() => showMeal(meal)}>
                <img src={meal.imageUrl} alt={meal.name} className="meal-image" />
                <h3 className="meal-title">{meal.name}</h3>
                <p className="meal-description">Calories: {meal.calories}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Upgrade to Premium</DialogTitle>
        <DialogContent>
          <p>
            You need a premium membership to access the healthy meal plans. 
            Please switch to a premium plan to unlock this feature.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Go to Pricing
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NutritionGuidance;
