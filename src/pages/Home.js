import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <h1>Welcome to the Event Management System</h1>
        <p>Browse upcoming events, register for the ones you like, and keep track of your registrations.</p>

        {!user && (
          <p>
            <Link to="/register" className="btn btn-primary">Create an account</Link>{" "}
            <Link to="/login" className="btn btn-secondary">Login</Link>
          </p>
        )}

        <p>
          <Link to="/events" className="btn btn-primary">Browse Events</Link>
        </p>
      </div>
    </div>
  );
}
