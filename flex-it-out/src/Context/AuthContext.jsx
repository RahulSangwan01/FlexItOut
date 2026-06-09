import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [membership, setMembership] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const storedUserId = localStorage.getItem("userId");
    const storedMembership = localStorage.getItem("membership");

    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setUserId(storedUserId);
      setMembership(storedMembership);
    }
  }, []);

  const signIn = (token, user) => {
    if (user && user.name) {
      localStorage.setItem("token", token);
      localStorage.setItem("username", user.name);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("membership", user.membership?.plan || "Free");

      setIsLoggedIn(true);
      setUsername(user.name);
      setUserId(user.id);
      setMembership(user.membership?.plan || "Free");
    } else {
      console.error("Error: Username is missing in the login response.");
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("membership");

    setIsLoggedIn(false);
    setUsername("");
    setUserId("");
    setMembership("");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, signIn, signOut, username, userId, membership }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Create and export the `useAuth` hook
export const useAuth = () => useContext(AuthContext);
