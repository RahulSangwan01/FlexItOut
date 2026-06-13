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
  const fromPage = searchParams.get("from") || "home";
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setMessage("Invalid session. Please try again.");
        setLoading(false);
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/checkout/verify-payment/${sessionId}`);
        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("membership", "premium");
          setMessage("✅ Payment Successful! Membership updated.");
          const redirectPath = fromPage === "pricing" ? "/pricing" : "/";
          setTimeout(() => navigate(redirectPath), 3000);
        } else {
          setMessage(`❌ Payment verification failed: ${data.error}`);
          setTimeout(() => navigate("/pricing"), 3000);
        }
      } catch (error) {
        setMessage("❌ Error verifying payment. Please contact support.");
        setTimeout(() => navigate("/pricing"), 3000);
      }
      setLoading(false);
    };

    verifyPayment();
  }, [sessionId, userId, navigate, fromPage]);

  return (
    <motion.div className="success-page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <div className="success-page-card">
        <h1>{loading ? "🔄 Processing..." : message}</h1>
      </div>
    </motion.div>
  );
};

export default SuccessPage;
