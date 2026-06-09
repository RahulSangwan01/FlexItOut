const PricingPlan = require("../models/PricingPlan");

// ✅ Get Pricing Plans from Database
const getPricingPlans = async (req, res) => {
  try {
    const plans = await PricingPlan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = { getPricingPlans };
