import React, { useState, useEffect } from "react";
import { Trophy, Medal, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import "./leaderboard.css";

const API_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL_PRODUCTION
    : import.meta.env.VITE_API_URL_TESTING || "http://localhost:5001";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState("all");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // ✅ Fixed: reset loading/error on every fetch
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${API_URL}/api/leaderboard?timeFrame=${timeFrame}`
        );
        setLeaderboard(response.data);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
        setError("Could not load leaderboard. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeFrame]);

  const getOrdinalSuffix = (i) => {
    const j = i % 10, k = i % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  // ✅ Get initials for avatar placeholder
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="clb-container">
      <h2 className="clb-title">🏆 Leaderboard</h2>
      <p className="clb-subtitle">Top performers across the community</p>

      <div className="clb-time-frame">
        {["all", "monthly", "weekly"].map((tf) => (
          <button
            key={tf}
            className={`clb-time-frame-btn ${timeFrame === tf ? "clb-active" : ""}`}
            onClick={() => setTimeFrame(tf)}
          >
            {tf === "all" ? "All Time" : tf.charAt(0).toUpperCase() + tf.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="clb-loading">
          <Loader2 className="clb-loading-icon" size={32} />
          <p>Loading leaderboard...</p>
        </div>
      ) : error ? (
        <p className="clb-error">{error}</p>
      ) : leaderboard.length === 0 ? (
        // ✅ Added: proper empty state
        <div className="clb-empty">
          <div className="clb-empty-icon">🏅</div>
          <p>No entries yet for this time period. Be the first!</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <table className="clb-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Athlete</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => {
                const name = entry.userId?.name || "Anonymous";
                return (
                  <motion.tr
                    key={entry._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
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

                    <td>
                      <div className="clb-player">
                        {entry.userId?.avatar ? (
                          <img
                            src={entry.userId.avatar}
                            alt={name}
                            className="clb-avatar"
                          />
                        ) : (
                          <div className="clb-avatar-placeholder">
                            {getInitials(name)}
                          </div>
                        )}
                        <span className="clb-name">{name}</span>
                      </div>
                    </td>

                    <td className="clb-score">
                      {entry.score.toLocaleString()}
                      {index === 0 && <Medal className="clb-medal" />}
                    </td>

                    <td className="clb-date">
                      {new Date(entry.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default Leaderboard;