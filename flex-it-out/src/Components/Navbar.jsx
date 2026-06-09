import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiBiceps } from "react-icons/gi";
import { FaBell } from "react-icons/fa";
import { AuthContext } from "../Context/AuthContext";
import "./Navbar.css";

const API_URL =
  import.meta.env.VITE_API_URL_PRODUCTION && import.meta.env.VITE_API_URL_TESTING
    ? (import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL_PRODUCTION
      : import.meta.env.VITE_API_URL_TESTING)
    : "http://localhost:5001";

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [invites, setInvites] = useState([]);
    const [showInvites, setShowInvites] = useState(false);
    const { isLoggedIn, signOut, username } = useContext(AuthContext);
    const notificationRef = useRef(null);
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoggedIn) {
            fetch(`${API_URL}/api/users/invites`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log("Fetched Invites:", data);
                    setInvites(data);
                })
                .catch((err) => console.error("Error fetching invites:", err));
        }
    }, [isLoggedIn]);

    const handleLogout = () => {
        signOut();
        setIsDropdownOpen(false);
        setMenuOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const toggleInvites = (e) => {
        e.stopPropagation();
        console.log("Toggling invites dropdown");
        setShowInvites((prev) => !prev);
    };

    // Close invites when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowInvites(false);
            }
        };

        if (showInvites) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [showInvites]);

    const goToMultiplayerBattle = (roomId, exerciseId) => {
        if (roomId) {
            navigate(`/multiplayer-battle/${roomId}?exercise=${exerciseId}`);
        } else {
            console.error("No roomId found for this invite");
        }
    };
    

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <GiBiceps className="logo-icon" /> FLEX IT OUT
                </Link>
            </div>

            <div className={`nav-links ${menuOpen ? "active" : ""}`}>
                <Link to="/workout" onClick={() => setMenuOpen(false)}>Workout</Link>
                <Link to="/leaderboard" onClick={() => setMenuOpen(false)}>Leaderboard</Link>

                {isLoggedIn && (
                    <div className="bell-icon-container">
                        <FaBell className="bell-icon" onClick={toggleInvites} style={{ cursor: "pointer" }} />
                        {invites.length > 0 && <span className="invite-count">{invites.length}</span>}
                    </div>
                )}

                {isLoggedIn ? (
                    <>
                        <span className="username" onClick={toggleDropdown}>
                            {username || "User"}
                        </span>
                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                <Link to="/profile" onClick={() => setMenuOpen(false)}>Account Information</Link>
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </>
                ) : (
                    <Link to="/Signin" onClick={() => setMenuOpen(false)}>Sign In</Link>
                )}
            </div>

            {/* Mobile Menu Button */}
            <div className={`menu-toggle ${menuOpen ? "active" : ""}`} onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            {/* Notification Panel */}
            {showInvites && (
                <div className="notification-panel" ref={notificationRef}>
                    <h3>Invites</h3>
                    {invites.length > 0 ? (
                        invites.map((invite, index) => (
                            <div
                                key={index}
                                className="invite-item"
                                onClick={() => goToMultiplayerBattle(invite.roomId, invite.challengeType)}
                            >
                                {invite.message || `Challenge from ${invite.sender?.name || "Unknown"} (${invite.challengeType})`}
                            </div>
                        ))
                    ) : (
                        <div className="invite-item">No invites</div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
