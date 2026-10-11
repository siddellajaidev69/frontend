import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Event Management System</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>

        {user && <Link to="/add-event">Add Event</Link>}
        {user && <Link to="/my-registrations">My Registrations</Link>}
        {isAdmin && <Link to="/admin">Admin Dashboard</Link>}

        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}

        {user && (
          <span className="navbar-user">
            Hi, {user.name} ({user.role})
            <button className="btn-link" onClick={handleLogout}>
              Logout
            </button>
          </span>
        )}
      </div>
    </nav>
  );
}
