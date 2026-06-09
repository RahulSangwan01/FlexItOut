import React, { useState } from "react";
import "./CalorieCalculator.css";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL_PRODUCTION && import.meta.env.VITE_API_URL_TESTING
    ? (import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL_PRODUCTION
      : import.meta.env.VITE_API_URL_TESTING)
    : "http://localhost:5001";

const CalorieCalculator = () => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState("1.2");
  const [calories, setCalories] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
   const userId = localStorage.getItem("userId");
  const calculateCalories = () => {
    if (!age || !weight || !height) {
      alert("Please fill in all fields!");
      return;
    }

    let bmr;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const dailyCalories = bmr * parseFloat(activity);
    setCalories(dailyCalories.toFixed(2));
  };

  const handleSubmit = async () => {
    if (!calories) {
      alert("Please calculate your calories first!");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }
  
    try {
      await axios.put(
        `${API_URL}/api/profile/${userId}`,
        { calories: Number(calories) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
  
      alert("Calories updated successfully!");
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to update calories");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calculator-wrapper">
      <button 
        className="toggle-btn" 
        onClick={() => setShowCalculator(!showCalculator)}
      >
        {showCalculator ? "Hide Calculator" : "Show Calculator"}
      </button>

      {showCalculator && (
        <div className="calculator-container">
          <h2>Calorie Calculator</h2>
          <div className="input-group">
            <label>Age:</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Gender:</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="input-group">
            <label>Weight (kg):</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Height (cm):</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Activity Level:</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)}>
              <option value="1.2">Sedentary</option>
              <option value="1.375">Light Activity</option>
              <option value="1.55">Moderate Activity</option>
              <option value="1.725">Very Active</option>
              <option value="1.9">Super Active</option>
            </select>
          </div>
          <button className="calculate-btn" onClick={calculateCalories}>Calculate</button>

          {calories && <h3 className="result">Your Daily Maintenance Calories: {calories} kcal</h3>}

          {calories && (
            <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Updating..." : "Save Calories"}
            </button>
          )}

          {error && <p className="error">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default CalorieCalculator;
