import React, { useState, useEffect } from "react";
import { Trophy, Medal, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios"; // Make sure axios is imported
import './leaderboard.css';
const API_URL =
  import.meta.env.VITE_API_URL_PRODUCTION && import.meta.env.VITE_API_URL_TESTING
    ? (import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL_PRODUCTION
      : import.meta.env.VITE_API_URL_TESTING)
    : "http://localhost:5001";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState("all");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/leaderboard?timeFrame=${timeFrame}`);
        if (response.status === 200) {
          setLeaderboard(response.data);
          console.log(response.data);
        } else {
          throw new Error("Failed to fetch leaderboard");
        }
      } catch (err) {
        setError("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [timeFrame]);

  const getOrdinalSuffix = (i) => {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  };

  return (
    <div className="clb-container">
      <h2 className="clb-title">Leaderboard</h2>
      <div className="clb-time-frame">
        <button
          className={`clb-time-frame-btn ${timeFrame === "all" ? "clb-active" : ""}`}
          onClick={() => setTimeFrame("all")}
        >
          All Time
        </button>
        <button
          className={`clb-time-frame-btn ${timeFrame === "monthly" ? "clb-active" : ""}`}
          onClick={() => setTimeFrame("monthly")}
        >
          Monthly
        </button>
        <button
          className={`clb-time-frame-btn ${timeFrame === "weekly" ? "clb-active" : ""}`}
          onClick={() => setTimeFrame("weekly")}
        >
          Weekly
        </button>
      </div>
      {loading ? (
        <div className="clb-loading">
          <Loader2 className="clb-loading-icon" />
          <p>Loading leaderboard...</p>
        </div>
      ) : error ? (
        <p className="clb-error">{error}</p>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <table className="clb-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <motion.tr
                  key={entry._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`clb-row ${index < 3 ? `clb-top-${index + 1}` : ""}`}
                >
                  <td className="clb-rank">
                    {index < 3 ? (
                      <Trophy className={`clb-trophy clb-trophy-${index + 1}`} />
                    ) : (
                      <span>
                        {index + 1}
                        <sup>{getOrdinalSuffix(index + 1)}</sup>
                      </span>
                    )}
                  </td>
                  <td className="clb-player">
                  <span>{entry.userId ? entry.userId.name : "Anonymous"}</span>
                </td>
                
                  <td className="clb-score">
                    {entry.score.toLocaleString()}
                    {index === 0 && <Medal className="clb-medal" />}
                  </td>
                  <td className="clb-date">{new Date(entry.date).toLocaleDateString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default Leaderboard;
