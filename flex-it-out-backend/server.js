const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
const app = express();
const server = http.createServer(app);

// ✅ Configure CORS Middleware
app.use(cors({
  origin: "https://flexitout.vercel.app",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));

// ✅ Manually Set CORS Headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://flexitout.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ✅ Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "https://flexitout.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const userRoutes = require("./routes/userRoutes");
const emailChangeRoutes = require("./routes/emailChangeRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const checkoutRoutes = require("./routes/createCheckoutSession");
const workoutRoutes = require("./routes/workoutRoutes");
const mealRoutes = require("./routes/fetchmealsRouter");
const videoRoutes = require("./routes/videoRoutes");
const groupRoutes = require("./routes/groupRoutes");

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/user", userRoutes);
app.use("/api/email", emailChangeRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/group", groupRoutes);

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);
  res.status(500).json({ error: "Something went wrong!" });
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => {
  console.error("❌ MongoDB Connection Error:", err);
  process.exit(1); // Exit if MongoDB connection fails
});

// ✅ Socket.io - Real-Time Chat
io.on("connection", (socket) => {
  console.log(`🔵 User connected: ${socket.id}`);

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`👥 User joined group: ${groupId}`);
  });

  socket.on("sendMessage", async ({ groupId, senderId, text }) => {
    console.log(`📩 Message from ${senderId} to group ${groupId}: ${text}`);
    io.to(groupId).emit("newMessage", { sender: senderId, text });
  });

  socket.on("disconnect", () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

// ✅ Handle Process Termination
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down server...");
  await mongoose.connection.close();
  server.close(() => {
    console.log("✅ Server closed successfully.");
    process.exit(0);
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
