const express = require("express");
const PricingPlan = require("../models/PricingPlan");

const router = express.Router();

// ✅ Get Pricing Plans from Database
router.get("/", async (req, res) => {
  try {
    const plans = await PricingPlan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
