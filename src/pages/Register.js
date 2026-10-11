import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    api
      .post("/auth/register", { name, email, password })
      .then(() => {
        setSuccess("Account created! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1200);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Registration failed.";
        setError(msg);
      });
  };

  return (
    <div className="container">
      <div className="card form-card">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <button type="submit" className="btn btn-primary">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
