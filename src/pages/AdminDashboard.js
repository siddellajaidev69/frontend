import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES } from "../categories";

const emptyForm = {
  id: null,
  name: "",
  description: "",
  date: "",
  location: "",
  maxParticipants: "",
  category: "",
};

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("manage"); // "manage" | "registrations"
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null); // NEW: dashboard numbers
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // For the "View Registrations" tab
  const [selectedEventId, setSelectedEventId] = useState("");
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadEvents();
  }, [user, isAdmin, navigate]);

  const loadEvents = () => {
    api.get("/events").then((res) => setEvents(res.data));
    api.get("/stats").then((res) => setStats(res.data)); // NEW
  };

  // NEW: download the registrations table as a CSV file (opens in Excel)
  const handleDownloadCsv = () => {
    const eventName = events.find((e) => String(e.id) === String(selectedEventId))?.name || "event";
    const rows = [["Name", "Email", "Registered On"]];
    registrations.forEach((r) => {
      rows.push([r.user.name, r.user.email, new Date(r.registrationDate).toLocaleString()]);
    });
    const csv = rows.map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");

    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `${eventName}-registrations.csv`;
    link.click();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      name: form.name,
      description: form.description,
      date: form.date,
      location: form.location,
      maxParticipants: parseInt(form.maxParticipants, 10),
      category: form.category || "",
    };

    const request = isEditing
      ? api.put(`/events/${form.id}`, payload)
      : api.post("/events", payload);

    request
      .then(() => {
        setMessage(isEditing ? "Event updated!" : "Event created!");
        resetForm();
        loadEvents();
      })
      .catch(() => setError("Something went wrong saving the event."));
  };

  const handleEdit = (event) => {
    setForm(event);
    setIsEditing(true);
    setMessage("");
    setError("");
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;

    api
      .delete(`/events/${id}`)
      .then(() => {
        setMessage("Event deleted.");
        loadEvents();
      })
      .catch(() => setError("Could not delete this event."));
  };

  const handleViewRegistrations = (eventId) => {
    setSelectedEventId(eventId);
    api.get(`/registrations/event/${eventId}`).then((res) => setRegistrations(res.data));
  };

  if (!user || !isAdmin) return null;

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>

      {stats && (
        <div className="stats">
          <div className="stat-box"><h3>{stats.totalEvents}</h3><p>Total Events</p></div>
          <div className="stat-box"><h3>{stats.upcomingEvents}</h3><p>Upcoming</p></div>
          <div className="stat-box"><h3>{stats.totalUsers}</h3><p>Users</p></div>
          <div className="stat-box"><h3>{stats.totalRegistrations}</h3><p>Registrations</p></div>
        </div>
      )}

      <div className="tabs">
        <button
          className={tab === "manage" ? "tab active" : "tab"}
          onClick={() => setTab("manage")}
        >
          Manage Events
        </button>
        <button
          className={tab === "registrations" ? "tab active" : "tab"}
          onClick={() => setTab("registrations")}
        >
          View Registrations
        </button>
      </div>

      {tab === "manage" && (
        <div>
          <div className="card form-card">
            <h3>{isEditing ? "Edit Event" : "Add New Event"}</h3>
            <form onSubmit={handleSubmit}>
              <label>Event Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />

              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="3" />

              <label>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required />

              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} required />

              <label>Category</label>
              <select name="category" value={form.category || ""} onChange={handleChange}>
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

              {message && <p className="success">{message}</p>}
              {error && <p className="error">{error}</p>}

              <button type="submit" className="btn btn-primary">
                {isEditing ? "Update Event" : "Add Event"}
              </button>
              {isEditing && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </form>
          </div>

          <h3>All Events</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Location</th>
                <th>Category</th>
                <th>Registered / Max</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{event.date}</td>
                  <td>{event.location}</td>
                  <td>{event.category}</td>
                  <td>{event.registeredCount} / {event.maxParticipants}</td>
                  <td>
                    <button className="btn-link" onClick={() => handleEdit(event)}>Edit</button>{" "}
                    <button className="btn-link danger" onClick={() => handleDelete(event.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "registrations" && (
        <div>
          <label>Select an event to view its registered users:</label>
          <select
            value={selectedEventId}
            onChange={(e) => handleViewRegistrations(e.target.value)}
          >
            <option value="">-- Choose an event --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>

          {selectedEventId && registrations.length > 0 && (
            <button className="btn btn-secondary" style={{ marginLeft: "10px" }} onClick={handleDownloadCsv}>
              Download CSV
            </button>
          )}

          {selectedEventId && (
            <table className="table" style={{ marginTop: "20px" }}>
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 && (
                  <tr><td colSpan="3">No one has registered for this event yet.</td></tr>
                )}
                {registrations.map((reg) => (
                  <tr key={reg.id}>
                    <td>{reg.user.name}</td>
                    <td>{reg.user.email}</td>
                    <td>{new Date(reg.registrationDate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
