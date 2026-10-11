import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    api
      .post("/auth/login", { email, password })
      .then((res) => {
        login(res.data);
        navigate("/");
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Login failed.";
        setError(msg);
      });
  };

  return (
    <div className="container">
      <div className="card form-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p style={{ fontSize: "0.85em", color: "#666" }}>
          Test accounts (from sample data): admin@example.com / admin123 (Admin),
          john@example.com / john123 (User)
        </p>
      </div>
    </div>
  );
}
