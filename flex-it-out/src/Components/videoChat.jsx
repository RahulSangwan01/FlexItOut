"use client";

import { useState, useEffect, useRef } from "react";
import { connect, createLocalTracks } from "twilio-video";
import axios from "axios";
import { Button, IconButton, CardContent, Snackbar, Alert } from "@mui/material";
import { VideoCameraFront, VideocamOff, Mic, MicOff, CallEnd, ScreenShare, StopScreenShare } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import './videoChat.css';
import socket from "./socket";

const API_URL =
  import.meta.env.VITE_API_URL_PRODUCTION && import.meta.env.VITE_API_URL_TESTING
    ? (import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL_PRODUCTION
      : import.meta.env.VITE_API_URL_TESTING)
    : "http://localhost:5001";

const VideoChat = () => {
  const { id } = useParams();  // Get roomId from URL
  const [videoRoom, setVideoRoom] = useState(null);
  const [localTracks, setLocalTracks] = useState([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const localVideoRef = useRef(null); // Ref for local video
  const screenShareRef = useRef(null); // Ref for screen sharing

  useEffect(() => {
    if (!id) return;

    // Notify server that user joined the room
    socket.emit("join-room", { roomId: id, userId: socket.id });

    socket.on("user-joined", (userId) => {
      console.log(`User ${userId} joined`);
      showSnackbar(`User ${userId} joined the call`, "info");
    });

    socket.on("user-left", (userId) => {
      console.log(`User ${userId} left`);
      showSnackbar(`User ${userId} left the call`, "warning");
      removeParticipantVideo(userId);
    });

    return () => {
      handleLeaveRoom();  // Ensures user is removed immediately on reload or unmount
    };
  }, [id]);

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleVideoCall = async () => {
    if (!id) return showSnackbar("Room ID is missing", "error");

    try {
      const res = await axios.get(`${API_URL}/api/group/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const roomId = res.data.roomId;

      const response = await axios.post(`${API_URL}/api/video/token`, { roomId }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const { token } = response.data;

      if (!token) {
        throw new Error("Failed to retrieve token.");
      }

      const tracks = await createLocalTracks({ audio: true, video: { width: 640 } });
      setLocalTracks(tracks);

      const room = await connect(token, { name: id, tracks });
      if (!room) {
        throw new Error("Failed to connect to room.");
      }

      setVideoRoom(room);

      room.participants.forEach(attachParticipantTracks);
      room.on("participantConnected", attachParticipantTracks);
      room.on("participantDisconnected", detachParticipantTracks);

      const localVideoTrack = tracks.find((track) => track.kind === "video");
      const localAudioTrack = tracks.find((track) => track.kind === "audio");

      if (localVideoTrack) {
        localVideoTrack.attach(localVideoRef.current); // Attach local video to the local video element
      }

      if (localAudioTrack) {
        room.localParticipant.publishTrack(localAudioTrack);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      showSnackbar(`Error joining room: ${error.message}`, "error");
    }
  };

  const handleLeaveRoom = () => {
    if (videoRoom) {
      socket.emit("leave-room", { roomId: id, userId: socket.id });

      // Stop all local tracks immediately
      localTracks.forEach((track) => track.stop());
  
      // Disconnect the video room
      videoRoom.disconnect();
  
      // Clear all video references
      setLocalTracks([]);
      setVideoRoom(null);
      setIsScreenSharing(false);
  
      // Remove remote video elements
      document.getElementById("remote-video-container").innerHTML = "";
  
      // Show snackbar notification immediately
      showSnackbar("You left the room.", "info");
  
      // Auto refresh the page after 1.5 seconds
      setTimeout(() => {
        window.location.reload();  // Refresh the page
      }, 600);
    }
  };
  
  const attachParticipantTracks = (participant) => {
    participant.tracks.forEach((publication) => {
      if (publication.track) {
        attachTrack(publication.track, participant.identity);
      }
    });
    participant.on("trackSubscribed", (track) => attachTrack(track, participant.identity));
  };

  const detachParticipantTracks = (participant) => {
    removeParticipantVideo(participant.identity);
  };

  const attachTrack = (track, participantId) => {
    if (track.kind === "video") {
      // Check if a video element for this participant already exists
      let videoElement = document.getElementById(`video-${participantId}`);
      
      if (!videoElement) {
        // Create a new video element if it doesn't exist
        videoElement = document.createElement("video");
        videoElement.id = `video-${participantId}`;
        videoElement.autoplay = true;
        videoElement.muted = true; // Mute remote videos to avoid echo
        const container = document.getElementById("remote-video-container");
        if (container) container.appendChild(videoElement);
      }

      // Attach the track to the video element
      track.attach(videoElement);
    }

    if (track.kind === "audio") {
      track.attach(); // Attach audio track
    }
  };

  const removeParticipantVideo = (participantId) => {
    const videoElement = document.getElementById(`video-${participantId}`);
    if (videoElement) {
      videoElement.remove(); // Remove the video element
    }
  };

  const toggleTrack = (trackType) => {
    localTracks.forEach((track) => {
      if (track.kind === trackType) {
        if (track.isEnabled) {
          track.disable();
        } else {
          track.enable();
        }
        if (trackType === "video") {
          setIsVideoEnabled(!track.isEnabled);
        } else if (trackType === "audio") {
          setIsAudioEnabled(!track.isEnabled);
        }
      }
    });
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      localTracks.forEach((track) => {
        if (track.kind === "video" && track.name === "screen") {
          track.stop();
        }
      });
      setIsScreenSharing(false);
    } else {
      try {
        const screenTrack = await createLocalTracks({ video: { width: 1280, height: 720, name: "screen" }, audio: false });
        screenTrack[0].attach(screenShareRef.current);
        videoRoom.localParticipant.publishTrack(screenTrack[0]);
        setIsScreenSharing(true);
      } catch (error) {
        console.error("Error sharing screen:", error);
        showSnackbar("Failed to share screen.", "error");
      }
    }
  };

  return (
    <div className="video-chat">
      <CardContent>
        {videoRoom ? (
          <div>
            <div className="video-container">
              {/* Local Video */}
              <div className="local-video-container">
                <video ref={localVideoRef} autoPlay muted className="local-video"></video>
              </div>
              {/* Remote Videos */}
              <div id="remote-video-container" className="remote-video-container"></div>
            </div>
            <div className="controls-container">
              <IconButton onClick={() => toggleTrack("video")} color={isVideoEnabled ? "primary" : "error"}>
                {isVideoEnabled ? <VideoCameraFront /> : <VideocamOff />}
              </IconButton>
              <IconButton onClick={() => toggleTrack("audio")} color={isAudioEnabled ? "primary" : "error"}>
                {isAudioEnabled ? <Mic /> : <MicOff />}
              </IconButton>
              <IconButton onClick={toggleScreenShare} color={isScreenSharing ? "primary" : "default"}>
                {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
              </IconButton>
              <IconButton onClick={handleLeaveRoom} color="error">
                <CallEnd />
              </IconButton>
            </div>
          </div>
        ) : (
          <Button variant="contained" color="primary" onClick={handleVideoCall}>Start Video Call</Button>
        )}
      </CardContent>
    </div>
  );
};

export default VideoChat;
