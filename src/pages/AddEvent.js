import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES } from "../categories";

const emptyForm = {
  name: "",
  description: "",
  date: "",
  location: "",
  maxParticipants: "",
  category: "",
};

export default function AddEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Only logged-in users can add an event
  if (!user) {
    navigate("/login");
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      name: form.name,
      description: form.description,
      date: form.date,
      location: form.location,
      maxParticipants: parseInt(form.maxParticipants, 10),
      category: form.category,
    };

    api
      .post("/events", payload)
      .then((res) => {
        setSuccess("Event created successfully!");
        setForm(emptyForm);
        // Send the user straight to the new event's details page
        setTimeout(() => navigate(`/events/${res.data.id}`), 1000);
      })
      .catch(() => setError("Something went wrong while creating the event."));
  };

  return (
    <div className="container">
      <div className="card form-card">
        <h2>Add a New Event</h2>
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          Fill in the details below to publish a new event. It will appear
          immediately on the Events page for everyone to see and register for.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Event Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
          />

          <label>Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required />

          <label>Location</label>
          <input name="location" value={form.location} onChange={handleChange} required />

          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">-- Choose a category --</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label>Maximum Participants</label>
          <input
            type="number"
            min="1"
            name="maxParticipants"
            value={form.maxParticipants}
            onChange={handleChange}
            required
          />

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <button type="submit" className="btn btn-primary">Create Event</button>
        </form>
      </div>
    </div>
  );
}
