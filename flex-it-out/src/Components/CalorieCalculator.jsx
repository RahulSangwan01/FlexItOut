import React, { useState } from "react";
import "./CalorieCalculator.css";
import axios from "axios";

// ✅ Fixed: correct API URL logic
const API_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL_PRODUCTION
    : import.meta.env.VITE_API_URL_TESTING || "http://localhost:5001";

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
    setError(null);

    // ✅ Fixed: use setError instead of alert for better UX
    if (!age || !weight || !height) {
      setError("Please fill in all fields before calculating.");
      return;
    }

    if (age <= 0 || weight <= 0 || height <= 0) {
      setError("Age, weight, and height must be positive numbers.");
      return;
    }

    const bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const dailyCalories = bmr * parseFloat(activity);
    setCalories(dailyCalories.toFixed(0)); // ✅ Fixed: whole number is cleaner
  };

  const handleSubmit = async () => {
    if (!calories) {
      setError("Calculate your calories first.");
      return;
    }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Session expired. Please log in again.");
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

      // ✅ Fixed: use inline success state instead of alert
      setError(null);
      alert("Daily calorie goal saved!");
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calculator-wrapper">
      <button
        className="toggle-btn"
        onClick={() => {
          setShowCalculator((prev) => !prev);
          setError(null);
        }}
      >
        {showCalculator ? "✕ Hide Calculator" : "🔥 Calorie Calculator"}
      </button>

      {showCalculator && (
        <div className="calculator-container">
          <h2>Daily Calorie Goal</h2>

          <div className="input-group">
            <label>Age</label>
            <input
              type="number"
              min="1"
              max="120"
              placeholder="e.g. 22"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="input-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Height (cm)</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Activity Level</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)}>
              <option value="1.2">Sedentary (desk job)</option>
              <option value="1.375">Light (1–3x/week)</option>
              <option value="1.55">Moderate (3–5x/week)</option>
              <option value="1.725">Very Active (6–7x/week)</option>
              <option value="1.9">Athlete (2x/day)</option>
            </select>
          </div>

          <button className="calculate-btn" onClick={calculateCalories}>
            Calculate
          </button>

          {calories && (
            <p className="result">
              🔥 Daily Maintenance: <strong>{calories} kcal</strong>
            </p>
          )}

          {calories && (
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save as My Goal"}
            </button>
          )}

          {error && <p className="error">⚠ {error}</p>}
        </div>
      )}
    </div>
  );
};

export default CalorieCalculator;