import React from "react";
import { useNavigate } from "react-router-dom"; // For navigation with React Router
import { Check, Star } from "lucide-react"; // For icons
import { Button, Card, CardContent, CardHeader, Typography, Grid } from "@mui/material"; // Import MUI components
import './PricingPlans.css'
const PricingPage = () => {
  const navigate = useNavigate();

  const handlePayment = (plan) => {
    navigate(`/payment?plan=${plan}`);
  };

  const plans = [
    {
      name: "Student Plan",
      price: "$21",
      features: [
        "Access to basic workout plans",
        "Community support",
        "Limited exercise tutorials",
        "Monthly progress tracking",
      ],
      type: "student",
    },
    {
      name: "Basic Plan",
      price: "$10",
      features: [
        "Access to all standard workout plans",
        "Community support & fitness tips",
        "Video tutorials for exercises",
        "Progress tracking & goal setting",
      ],
      type: "basic",
    },
    {
      name: "Premium Plan",
      price: "$50",
      features: [
        "Unlimited access to premium workouts",
        "Personalized fitness plan",
        "Live trainer support",
        "Advanced progress tracking & analytics",
      ],
      type: "premium",
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom align="center">
        Choose Your Plan
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {plans.map((plan, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card variant="outlined" className={`fitflex-pricing-card fitflex-pricing-card-${plan.type}`}>
              <CardHeader>
                <Typography variant="h6" className="fitflex-pricing-card-title">
                  {plan.name}
                </Typography>
                <Typography variant="body1" className="fitflex-pricing-card-price">
                  {plan.price}
                  <span>/month</span>
                </Typography>
              </CardHeader>
              <CardContent>
                <ul className="fitflex-pricing-feature-list">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="fitflex-pricing-feature-item" style={{ display: "flex", alignItems: "center" }}>
                      <Check className="fitflex-pricing-feature-icon" style={{ marginRight: "8px" }} />
                      <Typography variant="body2">{feature}</Typography>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <div style={{ padding: "16px", textAlign: "center" }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => handlePayment(plan.type)} 
                  fullWidth
                >
                  Select Plan
                </Button>
              </div>
              {plan.type === "premium" && (
                <div className="fitflex-pricing-popular-tag" style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "#f1c40f", padding: "5px", borderRadius: "5px", color: "#fff" }}>
                  <Star style={{ marginRight: "5px" }} />
                  Most Popular
                </div>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default PricingPage;
