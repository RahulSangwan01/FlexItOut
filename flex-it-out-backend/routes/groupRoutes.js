const express = require("express");
const authenticateUser = require("../Middleware/authMiddleware")
const {
  createGroup,
  getAllGroups,
  getGroupMessages,
  sendMessage,
  joinGroup,
  leaveGroup
} = require("../controllers/groupController");

const router = express.Router();

// ✅ Group Routes
router.post("/creategroup", authenticateUser, createGroup);
router.get("/fetchgroups", authenticateUser, getAllGroups);
router.get("/:id", authenticateUser, getGroupMessages);
router.post("/:id/message", authenticateUser, sendMessage);
router.post("/:id/join", authenticateUser, joinGroup);
router.post("/:id/leave", authenticateUser, leaveGroup);

module.exports = router;
