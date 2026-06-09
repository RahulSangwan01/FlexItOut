import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./CommunityPage.css";

const API_URL =
  import.meta.env.VITE_API_URL_PRODUCTION && import.meta.env.VITE_API_URL_TESTING
    ? (import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL_PRODUCTION
      : import.meta.env.VITE_API_URL_TESTING)
    : "http://localhost:5001";

const CommunityPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupName, setGroupName] = useState("");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/group/fetchgroups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data);
        setGroups(response.data);
      } catch (err) {
        setError("Failed to load groups.");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [token]);

  // Create Group Function
  const createGroup = async () => {
    if (!groupName.trim()) return;

    // Generate a complex roomId using uuid
    const roomId = uuidv4();

    try {
      const response = await axios.post(
        `${API_URL}/api/group/creategroup`,
        {
          name: groupName,
          members: [],
          roomId, 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGroups([...groups, response.data]);
      setGroupName(""); // Clear input after creation
    } catch (err) {
      alert("Failed to create group.");
    }
  };

  // Join Group Function
  const handleJoinGroup = async (groupId, roomId) => {
    const group = groups.find((g) => g._id === groupId);

    // Check if the user is already a member of the group
    if (group && group.members.some((member) => member._id === userId)) {
      alert("You are already a member of this group!");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/group/${groupId}/join`,
        {
          roomId, // Include roomId when joining a group
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGroups(
        groups.map((g) =>
          g._id === groupId ? { ...g, members: [...g.members, response.data] } : g
        )
      );
    } catch (err) {
      alert("Failed to join group.");
    }
  };

  return (
    <div className="community-container">
      <h1 className="community-title">Explore Groups</h1>
      <p className="community-description">Join communities that interest you!</p>

      <div className="create-group-container">
        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="group-input"
        />
        <button className="create-group-button" onClick={createGroup}>
          + Create Group
        </button>
      </div>

      {loading ? (
        <p className="loading-message">Loading groups...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="group-list">
          {groups.map((group) => (
            <div
              key={group._id}
              className="group-card"
              onClick={() => navigate(`/group/${group._id}`)}
            >
              <h2 className="group-name">{group.name}</h2>
              <p className="group-members">{group.members.length} members</p>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
