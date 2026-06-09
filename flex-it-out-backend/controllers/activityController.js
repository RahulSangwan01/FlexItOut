const Activity = require("../models/Activity");
const Leaderboard = require("../models/Leaderboard");

const logActivity = async (req, res) => {
    try {
        const { userId, activityType, count } = req.body;

        // Save activity record
        const activity = new Activity({ userId, activityType, count });
        await activity.save();

        // Update leaderboard score
        let leaderboardEntry = await Leaderboard.findOne({ userId });
        if (!leaderboardEntry) {
            leaderboardEntry = new Leaderboard({ userId, username: req.user.name, totalScore: count });
        } else {
            leaderboardEntry.totalScore += count;
            leaderboardEntry.lastUpdated = Date.now();
        }
        await leaderboardEntry.save();

        res.status(201).json({ message: "Activity logged successfully", activity });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

const getUserActivities = async (req, res) => {
    try {
        const activities = await Activity.find({ userId: req.params.userId }).sort({ timestamp: -1 });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

module.exports = { logActivity, getUserActivities };
