import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./EditProfile.css";

const API_URL =
  import.meta.env.VITE_API_URL_PRODUCTION && import.meta.env.VITE_API_URL_TESTING
    ? (import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL_PRODUCTION
      : import.meta.env.VITE_API_URL_TESTING)
    : "http://localhost:5001";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profileImage: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const [originalEmail, setOriginalEmail] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Fetch profile data on mount
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({ name: res.data.name, email: res.data.email });
        setPreviewImage(res.data.avatar);
        setOriginalEmail(res.data.email);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again.");
      }
    };

    if (token) fetchProfile();
    else navigate("/signin");
  }, [token, navigate, location.state]);

  // Handle form data changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file input for image upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && ["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setFormData({ ...formData, profileImage: file });
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setError("Invalid file type. Please upload a PNG or JPG image.");
    }
  };

  // Handle profile update
  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (type === "name") {
        await axios.put("https://flex-it-out-backend-1.onrender.com/api/user/profile", 
          { name: formData.name }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate("/profile", { state: { message: "Name updated successfully!" } });
      } 
      else if (type === "email") {
        if (formData.email === originalEmail) {
          setError("New email must be different from the current email.");
          return;
        }

        const res = await axios.post("https://flex-it-out-backend-1.onrender.com/api/email/request-email-change", 
          { newEmail: formData.email },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSuccess(res.data.message);
      } 
      else if (type === "profileImage") {
        const formDataToSend = new FormData();
        formDataToSend.append("profileImage", formData.profileImage);

        await axios.put("https://flex-it-out-backend-1.onrender.com/api/user/profile", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        navigate("/profile", { state: { message: "Profile photo updated successfully!" } });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Update failed. Please try again.");
    }
  };

  return (
    <div className="settings-page">
      <h1>Edit Profile</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-section">
        <h2 onClick={() => setActiveSection(activeSection === "name" ? null : "name")}>Edit Name</h2>
        {activeSection === "name" && (
          <form onSubmit={(e) => handleSubmit(e, "name")}> 
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              placeholder="John Doe" 
              onChange={handleChange} 
              required 
            />
            <button type="submit">Update Name</button>
          </form>
        )}
      </div>

      <div className="settings-section">
        <h2 onClick={() => setActiveSection(activeSection === "email" ? null : "email")}>Edit Email</h2>
        {activeSection === "email" && (
          <form onSubmit={(e) => handleSubmit(e, "email")}>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              placeholder="JohnDoe@gmail.com" 
              onChange={handleChange} 
              required 
            />
            <button type="submit">Update Email</button>
          </form>
        )}
      </div>

      <div className="settings-section">
        <h2 onClick={() => setActiveSection(activeSection === "profilePhoto" ? null : "profilePhoto")}>Change Profile Photo</h2>
        {activeSection === "profilePhoto" && (
          <form onSubmit={(e) => handleSubmit(e, "profileImage")}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            {previewImage && <img src={previewImage} alt="Profile" className="profile-image-preview" />}
            <button type="submit">Update Profile Photo</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
