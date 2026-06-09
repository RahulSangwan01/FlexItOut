const express = require("express");
const { requestEmailChange, verifyEmailChange } = require("../controllers/emailchangeController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/request-email-change", authMiddleware, requestEmailChange);
router.get("/verify-email-change", verifyEmailChange);

module.exports = router;
