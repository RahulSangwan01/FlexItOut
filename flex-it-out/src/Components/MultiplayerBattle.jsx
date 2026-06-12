import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { FaSearch, FaUserPlus } from "react-icons/fa";
import "./MultiplayerBattle.css";

const API_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL_PRODUCTION
    : import.meta.env.VITE_API_URL_TESTING || "http://localhost:5001";

// ✅ Fixed: moved socket inside component or use useRef to avoid module-level
// socket being shared across re-renders/hot reloads in dev
const MultiplayerBattle = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const exercise = searchParams.get("exercise");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const socketRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState({});

  // ✅ Fixed: socket created once per mount, cleaned up on unmount
  useEffect(() => {
    socketRef.current = io(API_URL, {
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    socket.emit("joinBattle", { roomId, userId });

    socket.on("updateParticipants", (updatedParticipants) => {
      setParticipants(updatedParticipants);
    });

    socket.on("playerJoined", ({ userId: joinedId, name }) => {
      setParticipants((prev) => {
        // ✅ Fixed: prevent duplicate entries
        if (prev.find((p) => p.userId === joinedId)) return prev;
        return [...prev, { userId: joinedId, name }];
      });
    });

    socket.on("playerLeft", ({ userId: leftId }) => {
      // ✅ Fixed: actually remove the player from participants
      setParticipants((prev) => prev.filter((p) => p.userId !== leftId));
    });

    socket.on("updateStats", ({ userId: uid, reps, score }) => {
      setStats((prev) => ({ ...prev, [uid]: { reps, score } }));
    });

    return () => {
      socket.emit("leaveBattle", { roomId, userId });
      socket.disconnect();
    };
  }, [roomId, userId]);

  // ✅ Debounced search
  useEffect(() => {
    if (searchTerm.length < 3) {
      setUsers([]);
      return;
    }
    const delay = setTimeout(fetchUsers, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/users/search`, {
        params: { query: searchTerm },
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (inviteeId) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/users/invite`,
        { inviterId: userId, inviteeId, exerciseId: exercise },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { roomId: newRoomId, challengeType } = response.data;
      alert("Invitation sent!");
      navigate(`/multiplayer-battle/${newRoomId}?exercise=${challengeType}`);
    } catch (error) {
      console.error("Error sending invite:", error);
      alert("Failed to send invite. Please try again.");
    }
  };

  const handleStartChallenge = () => {
    const returnUrl = `/multiplayer-battle/${roomId}?exercise=${exercise}`;
    navigate(`/pose-detection/${exercise}`, {
      state: { exercise, userId, returnUrl },
    });
  };

  return (
    <div className="battle-wrapper">
      <div className="battle-container">

        {/* Header */}
        <div className="battle-header">
          <h2>⚔️ Battle Room</h2>
          {exercise && (
            <span className="battle-exercise-badge">
              🏋️ {exercise}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users to invite (min. 3 chars)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={fetchUsers} className="search-button" title="Search">
            <FaSearch />
          </button>
        </div>

        {/* User results */}
        <div className="user-list">
          {loading ? (
            <p className="loading-text">Searching...</p>
          ) : searchTerm.length >= 3 && users.length === 0 ? (
            <p className="user-list-empty">No users found for "{searchTerm}"</p>
          ) : (
            users.map((user) => (
              <div key={user._id} className="user-card">
                <span className="username">{user.name}</span>
                <button
                  className="invite-button"
                  onClick={() => handleInvite(user._id)}
                >
                  <FaUserPlus /> Invite
                </button>
              </div>
            ))
          )}
        </div>

        {/* Participants */}
        <div className="participants-list">
          <h3>Participants · {participants.length}</h3>
          <div className="participants-container">
            {participants.length === 0 ? (
              <p className="no-participants">
                Waiting for players to join...
              </p>
            ) : (
              participants.map((user, index) => {
                const isYou = user.userId === userId;
                return (
                  <div key={index} className="participant-item">
                    <span className={isYou ? "participant-you" : ""}>
                      🏋️ {isYou ? "You" : user.name}
                    </span>
                    <div className="participant-stats">
                      <div className="stat-item">
                        <span className="stat-label">Reps</span>
                        <span className="stat-value">
                          {stats[user.userId]?.reps ?? 0}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Score</span>
                        <span className="stat-value">
                          {stats[user.userId]?.score ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Start */}
        <button className="start-button" onClick={handleStartChallenge}>
          🚀 Start {exercise} Challenge
        </button>

      </div>
    </div>
  );
};

export default MultiplayerBattle;