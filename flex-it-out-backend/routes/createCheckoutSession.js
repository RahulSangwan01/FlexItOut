const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Ensure required environment variables are set
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Stripe API key is missing from environment variables.");
  process.exit(1);
}

// Plan prices (in cents)
const prices = {
  basic: 1000, // $10.00
  premium: 5000, // $50.00
  student: 2100, // $21.00
};

// ✅ Create Stripe Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { plan, userId } = req.body;

    if (!prices[plan]) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    console.log(`🛒 Creating checkout session for User ID: ${userId}, Plan: ${plan}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      metadata: { userId, plan }, // Store user ID and plan in metadata
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `${plan.toUpperCase()} Plan` },
            unit_amount: prices[plan],
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    console.log(`✅ Checkout session created: ${session.id}`);

    res.json({ id: session.id });
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);
    res.status(500).json({ error: "Payment session creation failed" });
  }
});

// ✅ Verify Payment and Update Membership
router.get("/verify-payment/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    console.log(`🔍 Verifying payment for session ID: ${sessionId}`);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.metadata || !session.metadata.userId || !session.metadata.plan) {
      return res.status(400).json({ error: "Missing user or plan details" });
    }

    const { userId, plan } = session.metadata;

    if (session.payment_status !== "paid") {
      console.log(`❌ Payment for session ${sessionId} is not completed. Status: ${session.payment_status}`);
      return res.status(400).json({ error: `Payment not completed. Status: ${session.payment_status}` });
    }

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // Membership valid for 1 month

    await User.findByIdAndUpdate(userId, {
      membership: { plan, expiresAt: expiryDate },
    });

    console.log(`✅ Membership updated for User ID: ${userId}, Plan: ${plan}, Expiry: ${expiryDate}`);

    return res.json({ success: true, message: "Membership updated successfully" });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

module.exports = router;
