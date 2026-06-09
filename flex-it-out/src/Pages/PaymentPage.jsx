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


const stripePromise = loadStripe("pk_test_51QrIYaP7TDcxXgwZjsg5PRmU9NAATaVt87I42XPl2gLOjSRd2Jw2qxgo1bGKMCkJbau5oKHcEHuqgeSbaoahbk2G00H4yaXvcf");

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");

  const { userId, isLoggedIn } = useContext(AuthContext);
  const handlePayment = async () => {
    if (!isLoggedIn || !userId) {
      alert("You must be logged in to make a payment.");
      return;
    }

    setLoading(true);
    const stripe = await stripePromise;
  
    try {
      const response = await fetch(`${API_URL}/api/checkout/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment session failed");
      }
  
      const { id } = await response.json();
      if (!id) throw new Error("Invalid response from server");
  
      console.log("🔹 Redirecting to Stripe Checkout with session:", id);
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (error) {
      console.error("❌ Payment Error:", error.message);
      alert(`Payment Error: ${error.message}`);
    }
  
    setLoading(false);
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