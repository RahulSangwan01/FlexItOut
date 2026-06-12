import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiBiceps } from "react-icons/gi";
import { FaBell } from "react-icons/fa";
import { AuthContext } from "../Context/AuthContext";
import "./Navbar.css";

// ✅ Fixed: correct API_URL logic
const API_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_URL_PRODUCTION
    : import.meta.env.VITE_API_URL_TESTING || "http://localhost:5001";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [invites, setInvites] = useState([]);
  const [showInvites, setShowInvites] = useState(false);
  const { isLoggedIn, signOut, username } = useContext(AuthContext);
  const notificationRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Fetch invites when logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchInvites = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/invites`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch invites");
        const data = await res.json();
        setInvites(data);
      } catch (err) {
        console.error("Error fetching invites:", err);
      }
    };

    fetchInvites();
  }, [isLoggedIn]);

  // ✅ Fixed: close both dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowInvites(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    signOut();
    setIsDropdownOpen(false);
    setMenuOpen(false);
    navigate("/signin");
  };

  const goToMultiplayerBattle = (roomId, exerciseId) => {
    if (!roomId) {
      console.error("No roomId for this invite");
      return;
    }
    setShowInvites(false);
    navigate(`/multiplayer-battle/${roomId}?exercise=${exerciseId}`);
  };

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar-brand">
        <Link to="/">
          <GiBiceps className="logo-icon" /> FLEX IT OUT
        </Link>
      </div>

      {/* Nav Links */}
      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        <Link to="/workout" onClick={() => setMenuOpen(false)}>Workout</Link>
        <Link to="/leaderboard" onClick={() => setMenuOpen(false)}>Leaderboard</Link>

        {isLoggedIn && (
          // ✅ Notification bell
          <div
            className="bell-icon-container"
            ref={notificationRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowInvites((prev) => !prev);
            }}
          >
            <FaBell className="bell-icon" />
            {invites.length > 0 && (
              <span className="invite-count">{invites.length}</span>
            )}
          </div>
        )}

        {isLoggedIn ? (
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <span className="username" onClick={() => setIsDropdownOpen((p) => !p)}>
              {username || "User"}
            </span>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" onClick={() => { setIsDropdownOpen(false); setMenuOpen(false); }}>
                  Account
                </Link>
                <div className="dropdown-divider" />
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/signin" className="signin-btn" onClick={() => setMenuOpen(false)}>
            Sign In
          </Link>
        )}
      </div>

      {/* Hamburger */}
      <div
        className={`menu-toggle ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen((p) => !p)}
      >
        <span />
        <span />
        <span />
      </div>

      {/* Notification Panel — outside nav-links so it's always visible */}
      {showInvites && (
        <div className="notification-panel">
          <h3>Invites</h3>
          {invites.length > 0 ? (
            invites.map((invite, index) => (
              <div
                key={index}
                className="invite-item"
                onClick={() => goToMultiplayerBattle(invite.roomId, invite.challengeType)}
              >
                🏋️{" "}
                {invite.message ||
                  `Challenge from ${invite.sender?.name || "Someone"} · ${invite.challengeType}`}
              </div>
            ))
          ) : (
            <div className="invite-item empty">No pending invites</div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;