import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../Context/AuthContext";
import "./SuccessPage.css";

const API_URL =
  import.meta.env.VITE_API_URL_PRODUCTION && import.meta.env.VITE_API_URL_TESTING
    ? (import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL_PRODUCTION
      : import.meta.env.VITE_API_URL_TESTING)
    : "http://localhost:5001";

const SuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying payment...");
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !userId) {
        setMessage("Invalid session. Please try again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/checkout/verify-payment/${sessionId}`);
        const data = await response.json();

        if (response.ok) {
          setMessage("✅ Payment Successful! Membership updated.");
          setTimeout(() => navigate("/"), 3000); // Redirect after 3 sec
        } else {
          setMessage(`❌ Payment verification failed: ${data.error}`);
        }
      } catch (error) {
        setMessage("❌ Error verifying payment. Please contact support.");
        console.error("Payment Verification Error:", error);
      }
      setLoading(false);
    };

    verifyPayment();
  }, [sessionId, userId, navigate]);

  return (
    <motion.div className="success-page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <div className="success-page-card">
        <h1>{loading ? "🔄 Processing..." : message}</h1>
      </div>
    </motion.div>
  );
};

export default SuccessPage;
