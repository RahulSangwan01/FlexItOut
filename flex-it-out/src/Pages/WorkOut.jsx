"use client";
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FaDumbbell, FaChartLine, FaFire, FaMedal, FaHistory } from "react-icons/fa";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import confetti from "canvas-confetti";
import "./WorkoutPage.css";
import { AuthContext } from "../Context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL_PRODUCTION && import.meta.env.VITE_API_URL_TESTING
    ? import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL_PRODUCTION
      : import.meta.env.VITE_API_URL_TESTING
    : "http://localhost:5001";

const WorkoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useContext(AuthContext);

  const [exercises, setExercises] = useState([
    { id: "squat", name: "Squats", completed: false, reps: 0, score: 0, target: 20 },
    { id: "pushup", name: "Push-ups", completed: false, reps: 0, score: 0, target: 15 },
    { id: "highKnee", name: "High Knees", completed: false, reps: 0, score: 0, target: 30 },
    { id: "lunges", name: "Lunges", completed: false, reps: 0, score: 0, target: 20 },
  ]);

  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [challenges, setChallenges] = useState([
    { id: "squatChallenge", name: "Squat Challenge", target: 20, completed: false },
    { id: "pushupChallenge", name: "Push-up Challenge", target: 15, completed: false },
    { id: "highKneeChallenge", name: "High Knee Challenge", target: 30, completed: false },
    { id: "lungesChallenge", name: "Lunges Challenge", target: 20, completed: false },
  ]);

  const [activeTab, setActiveTab] = useState("exercises");
  const [streak, setStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  // Update exercises when returning from Pose Detection
  useEffect(() => {
    if (location.state) {
      const { exerciseId, reps, score } = location.state;
      setExercises((prevExercises) =>
        prevExercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, completed: true, reps, score }
            : exercise
        )
      );
    }
  }, [location.state]);

  // Fetch user data (streak and total score)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/${userId}`);
        const data = await response.json();
        setStreak(data.streak);
        setTotalScore(data.score);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  // Fetch workout history
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/workouts/${userId}`);
        const data = await response.json();
        setWorkoutHistory(data);
      } catch (error) {
        console.error("Error fetching workouts:", error);
      }
    };

    fetchWorkouts();
  }, [userId]);

  // Update total score when exercises change
  useEffect(() => {
    const newTotalScore = exercises.reduce((sum, exercise) => sum + exercise.score, 0);
    setTotalScore(newTotalScore);
  }, [exercises]);

  // Handle completing the workout
  const handleCompleteWorkout = async () => {
    const workoutData = exercises.map((exercise) => ({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      reps: exercise.reps,
      score: exercise.score,
    }));

    try {
      const response = await fetch(`${API_URL}/api/workouts/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          exercises: workoutData,
          totalScore,
          streak,
        }),
      });

      if (response.ok) {
        // Post the score to the leaderboard
        try {
          await axios.post(`${API_URL}/api/leaderboard`, {
            userId,
            score: totalScore,
          });
          alert("Score added to leaderboard!");
        } catch (error) {
          console.error("Error posting score", error);
        }

        // Display confetti and alert the user
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        alert("Workout completed and saved! Great job!");

        // Reset exercises and update streak
        setExercises((prevExercises) =>
          prevExercises.map((exercise) => ({
            ...exercise,
            completed: false,
            reps: 0,
            score: 0,
          }))
        );
        setStreak(streak + 1);
      } else {
        console.error("Failed to save workout");
      }
    } catch (error) {
      console.error("Error saving workout:", error);
    }
  };

  const handleStartChallenge = (challengeId) => {
    // Find the challenge
    const challenge = challenges.find(challenge => challenge.id === challengeId);
    const returnUrl = "/workout";
    navigate(`/pose-detection/${challengeId}?returnUrl=${returnUrl}`, { state: { challenge, userId } });

  };
  const renderTabContent = () => {
    switch (activeTab) {
      case "exercises":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="exercises-list"
          >
            <h2>
              <FaDumbbell /> Exercises
            </h2>
            {exercises.map((exercise) => (
              <div key={exercise.id} className="exercise-card">
                <div className="exercise-info">
                  <h3>{exercise.name}</h3>
                  <p>Target: {exercise.target} reps</p>
                </div>
                {exercise.completed ? (
                  <div className="exercise-result">
                    <CircularProgressbar
                      value={(exercise.reps / exercise.target) * 100}
                      text={`${exercise.reps}/${exercise.target}`}
                      styles={buildStyles({
                        textSize: "22px",
                        pathTransitionDuration: 0.5,
                        pathColor: `rgba(62, 152, 199, ${exercise.reps / exercise.target})`,
                        textColor: "#2c3e50",
                        trailColor: "#d6d6d6",
                      })}
                    />
                    <span className="exercise-score">Score: {exercise.score}</span>
                  </div>
                ) : (
                    <Link to={`/pose-detection/${exercise.id}?returnUrl=/workout`}>
                    <button className="start-button">Start</button>
                  </Link>
                  
                )}
              </div>
            ))}
            <button className="complete-workout-button" onClick={handleCompleteWorkout}>
              Complete Workout
            </button>
          </motion.div>
        );
      // Rest of the tab content...
    }
  };

  return (
    <div className="workout-container">
      <header className="workout-header">
        <h1>FitTrack Pro 🏋️</h1>
        <div className="user-stats">
          <div className="streak">
            <FaFire className="streak-icon" />
            <span>{streak} day streak</span>
          </div>
          <div className="total-score">
            <FaMedal className="score-icon" />
            <span>{totalScore} points</span>
          </div>
        </div>
      </header>

      <nav className="workout-nav">
        <button className={activeTab === "exercises" ? "active" : ""} onClick={() => setActiveTab("exercises")}>
          <FaDumbbell /> Exercises
        </button>
        <button
            className={activeTab === "challenges" ? "active" : ""}
            onClick={() => navigate("/multiplayer-challenges")}
            >
            <FaChartLine /> Multiplayer Challenges
        </button>

        <button className={activeTab === "trackProgress" ? "active" : ""} onClick={() => setActiveTab("trackProgress")}>
          <FaHistory /> Track Progress
        </button>
      </nav>

      <AnimatePresence exitBeforeEnter>{renderTabContent()}</AnimatePresence>
    </div>
  )
}

export default WorkoutPage