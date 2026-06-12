"use client";

import { useState, useEffect, useRef } from "react";
import { connect, createLocalTracks } from "twilio-video";
import axios from "axios";
import {
  Button,
  IconButton,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  VideoCameraFront,
  VideocamOff,
  Mic,
  MicOff,
  CallEnd,
  ScreenShare,
  StopScreenShare,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import "./videoChat.css";
import socket from "./socket";

// ✅ Fixed: correct API_URL logic
const API_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL_PRODUCTION
    : import.meta.env.VITE_API_URL_TESTING || "http://localhost:5001";

const VideoChat = () => {
  const { id } = useParams();
  const [videoRoom, setVideoRoom] = useState(null);
  const [localTracks, setLocalTracks] = useState([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const localVideoRef = useRef(null);
  const screenShareRef = useRef(null);

  // ✅ Keep ref to latest videoRoom/localTracks for cleanup
  const videoRoomRef = useRef(null);
  const localTracksRef = useRef([]);

  useEffect(() => {
    videoRoomRef.current = videoRoom;
  }, [videoRoom]);

  useEffect(() => {
    localTracksRef.current = localTracks;
  }, [localTracks]);

  useEffect(() => {
    if (!id) return;

    socket.emit("join-room", { roomId: id, userId: socket.id });

    socket.on("user-joined", (userId) => {
      showSnackbar(`A user joined the call`, "info");
    });

    socket.on("user-left", (userId) => {
      showSnackbar(`A user left the call`, "warning");
      removeParticipantVideo(userId);
    });

    return () => {
      socket.off("user-joined");
      socket.off("user-left");
      // ✅ Fixed: use refs so cleanup sees latest state
      cleanupRoom(videoRoomRef.current, localTracksRef.current);
    };
  }, [id]);

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const cleanupRoom = (room, tracks) => {
    if (!room) return;
    socket.emit("leave-room", { roomId: id, userId: socket.id });
    tracks.forEach((track) => track.stop());
    room.disconnect();
    const container = document.getElementById("remote-video-container");
    if (container) container.innerHTML = "";
  };

  const handleVideoCall = async () => {
    if (!id) return showSnackbar("Room ID is missing", "error");

    try {
      const groupRes = await axios.get(`${API_URL}/api/group/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const roomId = groupRes.data.roomId;

      const tokenRes = await axios.post(
        `${API_URL}/api/video/token`,
        { roomId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const { token } = tokenRes.data;
      if (!token) throw new Error("Failed to retrieve token.");

      const tracks = await createLocalTracks({ audio: true, video: { width: 640 } });
      setLocalTracks(tracks);

      const room = await connect(token, { name: id, tracks });
      if (!room) throw new Error("Failed to connect to room.");

      setVideoRoom(room);

      const localVideoTrack = tracks.find((t) => t.kind === "video");
      if (localVideoTrack && localVideoRef.current) {
        localVideoTrack.attach(localVideoRef.current);
      }

      room.participants.forEach(attachParticipantTracks);
      room.on("participantConnected", attachParticipantTracks);
      room.on("participantDisconnected", detachParticipantTracks);
    } catch (error) {
      console.error("Error joining room:", error);
      showSnackbar(`Error joining: ${error.message}`, "error");
    }
  };

  const handleLeaveRoom = () => {
    cleanupRoom(videoRoom, localTracks);
    setLocalTracks([]);
    setVideoRoom(null);
    setIsScreenSharing(false);
    showSnackbar("You left the room.", "info");

    // ✅ Fixed: shorter delay, use navigate instead of hard reload when possible
    setTimeout(() => window.location.reload(), 600);
  };

  const attachParticipantTracks = (participant) => {
    participant.tracks.forEach((pub) => {
      if (pub.track) attachTrack(pub.track, participant.identity);
    });
    participant.on("trackSubscribed", (track) =>
      attachTrack(track, participant.identity)
    );
  };

  const detachParticipantTracks = (participant) => {
    removeParticipantVideo(participant.identity);
  };

  const attachTrack = (track, participantId) => {
    if (track.kind === "video") {
      let videoEl = document.getElementById(`video-${participantId}`);
      if (!videoEl) {
        videoEl = document.createElement("video");
        videoEl.id = `video-${participantId}`;
        videoEl.autoplay = true;
        videoEl.muted = true;
        const container = document.getElementById("remote-video-container");
        if (container) container.appendChild(videoEl);
      }
      track.attach(videoEl);
    }
    if (track.kind === "audio") {
      track.attach();
    }
  };

  const removeParticipantVideo = (participantId) => {
    document.getElementById(`video-${participantId}`)?.remove();
  };

  const toggleTrack = (trackType) => {
    localTracks.forEach((track) => {
      if (track.kind !== trackType) return;
      if (track.isEnabled) {
        track.disable();
      } else {
        track.enable();
      }
      if (trackType === "video") setIsVideoEnabled(track.isEnabled);
      if (trackType === "audio") setIsAudioEnabled(track.isEnabled);
    });
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      localTracks.forEach((track) => {
        if (track.kind === "video" && track.name === "screen") track.stop();
      });
      setIsScreenSharing(false);
    } else {
      try {
        // ✅ Fixed: use getDisplayMedia properly via navigator
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = stream.getVideoTracks()[0];
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = stream;
          screenShareRef.current.classList.add("active");
        }
        await videoRoom?.localParticipant.publishTrack(screenTrack);
        setIsScreenSharing(true);
      } catch (error) {
        console.error("Screen share error:", error);
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
              <div className="local-video-container">
                <video ref={localVideoRef} autoPlay muted className="local-video" />
                <span className="local-video-label">You</span>
              </div>
              <div id="remote-video-container" className="remote-video-container" />
              <video ref={screenShareRef} className="screen-share" autoPlay />
            </div>

            <div className="controls-container">
              <IconButton
                onClick={() => toggleTrack("video")}
                color={isVideoEnabled ? "primary" : "error"}
                title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {isVideoEnabled ? <VideoCameraFront /> : <VideocamOff />}
              </IconButton>

              <IconButton
                onClick={() => toggleTrack("audio")}
                color={isAudioEnabled ? "primary" : "error"}
                title={isAudioEnabled ? "Mute mic" : "Unmute mic"}
              >
                {isAudioEnabled ? <Mic /> : <MicOff />}
              </IconButton>

              <IconButton
                onClick={toggleScreenShare}
                color={isScreenSharing ? "primary" : "default"}
                title={isScreenSharing ? "Stop sharing" : "Share screen"}
              >
                {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
              </IconButton>

              <IconButton onClick={handleLeaveRoom} color="error" title="Leave call">
                <CallEnd />
              </IconButton>
            </div>
          </div>
        ) : (
          <div className="start-call-container">
            <p>Ready to join the group session?</p>
            <Button variant="contained" color="primary" onClick={handleVideoCall}>
              🎥 Start Video Call
            </Button>
          </div>
        )}
      </CardContent>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default VideoChat;