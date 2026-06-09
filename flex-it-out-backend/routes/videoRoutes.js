const express = require("express")
const router = express.Router()
const twilio = require("twilio")
const { v4: uuidv4 } = require("uuid")
require("dotenv").config()

const accountSid = process.env.TWILIO_ACCOUNT_SID
const apiKeySid = process.env.TWILIO_SID
const apiKeySecret = process.env.TWILIO_SECRET

const AccessToken = twilio.jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

router.post("/token", (req, res) => {
    const { roomId } = req.body;

    if (!roomId) {
        return res.status(400).json({ error: "roomId name is required" });
    }

    const identity = `User-${uuidv4()}`;

    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, { ttl: 3600, identity });
    token.identity = identity;

    const videoGrant = new VideoGrant({ roomId });
    token.addGrant(videoGrant);

    console.log("Generated Token:", token.toJwt());
    res.json({ token: token.toJwt() });
});

module.exports = router