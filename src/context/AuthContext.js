import React, { createContext, useContext, useState, useEffect } from "react";

// This is a simple beginner-friendly "who is logged in" store.
// We keep the current user in React state AND in localStorage so that
// refreshing the page doesn't log the user out.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // On first load, check if a user was already logged in (saved in localStorage)
  useEffect(() => {
    const saved = localStorage.getItem("eventapp_user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("eventapp_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("eventapp_user");
  };

  const isAdmin = user && user.role === "ADMIN";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so pages can just call: const { user, login, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
