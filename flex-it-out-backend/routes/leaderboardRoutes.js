const express = require("express");
const Leaderboard = require("../models/Leaderboard");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find()
      .sort({ score: -1 })
      .limit(10)
      .populate("userId", "name")
      .exec();
    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch leaderboard." });
  }
});

router.post("/", async (req, res) => {
  const { userId, score } = req.body;

  try {
    const existingEntry = await Leaderboard.findOne({ userId });

    if (existingEntry) {
      if (score > existingEntry.score) {
        existingEntry.score = score;
        await existingEntry.save();
        return res.status(200).json(existingEntry);
      } else {
        return res.status(200).json({ message: "New score is not higher than existing score." });
      }
    } else {
      const newScore = new Leaderboard({ userId, score });
      await newScore.save();
      return res.status(201).json(newScore);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to post score." });
  }
});

module.exports = router;