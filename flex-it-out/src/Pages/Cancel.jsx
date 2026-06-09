import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";


const CancelPage = () => {
  return (
    <motion.div className="cancel-page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <div className="cancel-page-card">
        <h1>❌ Payment Cancelled</h1>
        <p>Your payment was not completed. You can try again.</p>
        <Link to="/pricing">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Choose a Plan
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};

export default CancelPage;
