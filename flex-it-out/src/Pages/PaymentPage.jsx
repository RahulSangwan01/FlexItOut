import React, { useState, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCreditCard, FaSpinner } from "react-icons/fa";
import { AuthContext } from "../Context/AuthContext"; // Import authentication context
import "./PaymentPage.css";

const API_URL =
  import.meta.env.VITE_API_URL_PRODUCTION && import.meta.env.VITE_API_URL_TESTING
    ? (import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL_PRODUCTION
      : import.meta.env.VITE_API_URL_TESTING)
    : "http://localhost:5001";

console.log("Stripe Key:", import.meta.env.VITE_STRIPE_PUBLIC_KEY);
console.log("Mode:", import.meta.env.MODE);
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");
  const fromPage = searchParams.get("from") || "home";

  const { userId, isLoggedIn } = useContext(AuthContext);
  const handlePayment = async () => {
    if (!isLoggedIn || !userId) {
      setError("You must be logged in to make a payment.");
      return;
    }

    setLoading(true);
    setError("");
    const stripe = await stripePromise;

    try {
      const response = await fetch(`${API_URL}/api/checkout/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId, fromPage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment session failed");
      }

      const { id } = await response.json();
      if (!id) throw new Error("Invalid response from server");

      const result = await stripe.redirectToCheckout({
        sessionId: id,
      });

      if (result?.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };


  return (
    <motion.div
      className="payment-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="payment-page-card">
        <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}>
          Complete Your Payment
        </motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}>
          You selected: <strong>{plan?.toUpperCase()}</strong>
        </motion.p>
        {error && (
          <motion.div
            className="payment-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}
        <motion.button
          onClick={handlePayment}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {loading ? <><FaSpinner className="payment-page-spinner" /> Processing...</> : <><FaCreditCard /> Pay Now</>}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PaymentPage;
