import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { GiBiceps } from "react-icons/gi";
import "./Signup.css"; // ✅ shared auth stylesheet

// ✅ Fixed: correct API_URL logic
const API_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL_PRODUCTION
    : import.meta.env.VITE_API_URL_TESTING || "http://localhost:5001";

const SignIn = () => {
  const [formData, setFormData] = useState({ emailOrPhone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // ✅ clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isPhone = /^[0-9]{10}$/.test(formData.emailOrPhone);
      const loginData = {
        emailOrPhone: formData.emailOrPhone,
        password: formData.password,
        isPhone,
      };

      const res = await axios.post(`${API_URL}/api/auth/login`, loginData);
      const { token, user } = res.data;

      if (token && user) {
        signIn(token, user);
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("username", user.name);
        localStorage.setItem("membership", user.membership?.plan || "free");
        navigate("/");
      } else {
        setError("Unexpected response from server. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <GiBiceps />
        </div>
        <h2>Welcome back</h2>
        <p className="auth-tagline">Sign in to continue your fitness journey</p>

        {error && <p className="error">⚠ {error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <label htmlFor="emailOrPhone">Email or Phone</label>
            <input
              id="emailOrPhone"
              type="text"
              name="emailOrPhone"
              placeholder="you@example.com or 9876543210"
              onChange={handleChange}
              value={formData.emailOrPhone}
              required
              autoComplete="username"
            />
          </div>

          <div className="input-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              value={formData.password}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p>
          Don't have an account?{" "}
          <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;