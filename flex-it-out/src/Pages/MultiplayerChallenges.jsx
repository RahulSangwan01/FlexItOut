import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./MultiplayerChallenges.css";

const API_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL_PRODUCTION
    : import.meta.env.VITE_API_URL_TESTING || "http://localhost:5001";

const MultiplayerChallenges = () => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const exercises = [
    { id: "squat", name: "Squats", target: 15 },
    { id: "pushup", name: "Push-ups", target: 20 },
    { id: "highKnee", name: "High Knees", target: 30 },
    { id: "lunges", name: "Lunges", target: 12 },
  ];

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 3) {
        fetchUsers();
      }
    }, 500); // Debounce API calls

    return () => clearTimeout(delayDebounce);
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

  const handleInvite = async (inviteeId, exerciseId ) => {
    console.log(inviteeId, exerciseId)
    console.log(userId)
    
    try {
      const response = await axios.post(
        `${API_URL}/api/users/invite`,
        { inviterId: userId, inviteeId, exerciseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { roomId, challengeType } = response.data;
      alert("Invitation sent!");
      navigate(`/multiplayer-battle/${roomId}?exercise=${challengeType}`); 
    } catch (error) {
      console.error("Error sending invite:", error);
      alert("Failed to send invite. Please try again.");
    }
  };

  return (
    <div className="multiplayer-container">
      <h2>Multiplayer Challenges</h2>

      <div className="search-bar">
        <input
          type="te?xt"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={fetchUsers}>
          <FaSearch />
        </button>
      </div>

      {loading && <p>Loading users...</p>}
      {users.length === 0 && !loading && searchTerm.length >= 3 && <p>No users found.</p>}

      {users.length > 0 && (
        <div className="exercise-list">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="exercise-card">
              <h3>{exercise.name}</h3>
              <p>Target: {exercise.target} reps</p>
              <div className="user-list">
                {users.map((user) => (
                  <div key={user._id} className="user-card">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt="Profile"
                      className="user-avatar"
                    />
                    <span className="username">{user.name}</span>
                    <button onClick={() => handleInvite(user._id, exercise.id)}>
                      <FaUserPlus /> Invite
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiplayerChallenges;
