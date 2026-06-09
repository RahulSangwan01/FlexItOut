import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "./GroupPage.css";
import VideoChat from "../Components/videoChat";

const SOCKET_URL =
  import.meta.env.VITE_NODE_ENV === "development"
    ? import.meta.env.VITE_API_URL_TESTING
    : import.meta.env.VITE_API_URL_PRODUCTION;

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // Ensures better connectivity
})

const GroupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [joined, setJoined] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Fetch Group Data
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axios.get(`${SOCKET_URL}/api/group/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Group Data:", response.data);
        setGroup(response.data);
        setMessages(response.data.messages || []);
        setJoined(response.data.isMember);
      } catch (error) {
        console.error("Failed to fetch group data", error);
      }
    };

    fetchGroup();
  }, [id, token]);

  // 🔹 Connect to the group in Socket.io with roomId
  useEffect(() => {
    if (joined && group?.roomId) {
      socket.emit("joinRoom", group.roomId); // Use roomId here
    }

    return () => {
      socket.off("newMessage"); // Proper cleanup
    };
  }, [joined, id, group?.roomId]);

  // 🔹 Listen for real-time messages
  useEffect(() => {
    const handleNewMessage = (message) => {
      console.log("New message received:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage); // Proper cleanup
    };
  }, []);

  // ✅ Join Group
  const handleJoin = async () => {
    try {
      const response = await axios.post(
        `${SOCKET_URL}/api/group/${id}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJoined(true);
      socket.emit("joinRoom", group.roomId); // Join with roomId
    } catch (error) {
      console.error("Failed to join group", error);
    }
  };

  // ✅ Leave Group
  const handleLeave = async () => {
    try {
      const response = await axios.post(
        `${SOCKET_URL}/api/group/${id}/leave`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJoined(false);
      socket.emit("leaveRoom", group.roomId);
    } catch (error) {
      console.error("Failed to leave group", error);
    }
  };

  // ✅ Send Message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(
        `${SOCKET_URL}/api/group/${id}/message`,
        { text: newMessage, senderId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newMsg = response.data;
      socket.emit("sendMessage", { roomId: group.roomId, message: newMsg }); // Emit with roomId

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!group) return <p className="loading-message">Loading group...</p>;

  return (
    <div className="group-container">
      <h1 className="group-title">{group.name}</h1>
      <button className="join-button" onClick={joined ? handleLeave : handleJoin}>
        {joined ? "Leave Group" : "Join Group"}
      </button>


      {joined && (
        <VideoChat />
      )}

      <div className="members-list">
        <h2>Members</h2>
        <ul>
          {group.members.map((member) => (
            <li key={member._id}>{member.name}</li>
          ))}
        </ul>
      </div>

      {joined && (
        <div className="group-chat">
          <h2>Group Chat</h2>
          <div className="chat-box">
            {messages.map((msg, index) => (
              <div key={index} className="chat-message">
                <p>
                  <strong>{msg.sender?.name || "Unknown"}:</strong> {msg.text}
                </p>
                <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>

          <div className="message-form">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupPage;