const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    activityType: { type: String, required: true }, // e.g., "Squats", "Push-ups"
    count: { type: Number, required: true }, // Number of repetitions
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Activity", ActivitySchema);
