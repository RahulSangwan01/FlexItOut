import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { GiBiceps } from "react-icons/gi";
import "./Signup.css"; // ✅ shared auth stylesheet

// ✅ Fixed: correct API_URL logic
const API_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL_PRODUCTION
    : import.meta.env.VITE_API_URL_TESTING || "http://localhost:5001";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
    setError(""); // ✅ clear error on change
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword, phone } = formData;

    if (!name || !email || !password || !confirmPassword || !phone) {
      return "All fields are required.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return "Enter a valid email address.";
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return "Phone number must be 10 digits.";
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)) {
      return "Password needs 6+ chars, 1 uppercase, 1 lowercase, 1 number.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      await axios.post(`${API_URL}/api/auth/register`, userData);
      navigate("/signin");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name",            label: "Full Name",       type: "text",     placeholder: "Rahul Sangwan",          autoComplete: "name" },
    { name: "email",           label: "Email",           type: "email",    placeholder: "you@example.com",        autoComplete: "email" },
    { name: "phone",           label: "Phone Number",    type: "text",     placeholder: "10-digit number",        autoComplete: "tel" },
    { name: "password",        label: "Password",        type: "password", placeholder: "Min 6 chars, A-z, 0-9", autoComplete: "new-password" },
    { name: "confirmPassword", label: "Confirm Password",type: "password", placeholder: "Repeat your password",  autoComplete: "new-password" },
  ];

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <GiBiceps />
        </div>
        <h2>Create account</h2>
        <p className="auth-tagline">Start your fitness journey today</p>

        {error && <p className="error">⚠ {error}</p>}

        <form onSubmit={handleSubmit}>
          {fields.map(({ name, label, type, placeholder, autoComplete }) => (
            <div className="input-field" key={name}>
              <label htmlFor={name}>{label}</label>
              <input
                id={name}
                type={type}
                name={name}
                placeholder={placeholder}
                onChange={handleChange}
                value={formData[name]}
                autoComplete={autoComplete}
                required
              />
            </div>
          ))}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;