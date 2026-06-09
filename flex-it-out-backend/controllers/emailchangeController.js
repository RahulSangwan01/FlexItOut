const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/emailService");

exports.requestEmailChange = async (req, res) => {
    console.log("Request received:", req.body, req.user); // Debugging line
    const { newEmail } = req.body;
    const userId = req.user?.id;

    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
        console.log("Invalid email format"); // Debugging line
        return res.status(400).json({ message: "Invalid email format." });
    }

    try {
        const emailChangeToken = jwt.sign(
            { userId, newEmail },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        await sendVerificationEmail(newEmail, emailChangeToken);
        res.json({ message: "Verification email sent. Check your inbox." });
    } catch (error) {
        console.error("Error sending verification email:", error); // Debugging line
        res.status(500).json({ message: "Error sending verification email." });
    }
};


exports.verifyEmailChange = async (req, res) => {
    const { token } = req.query;

    try {
        const { userId, newEmail } = jwt.verify(token, process.env.JWT_SECRET);
        await User.findByIdAndUpdate(userId, { email: newEmail });
        res.json({ message: "Email updated successfully! You can now log in with your new email." });
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token." });
    }
};
