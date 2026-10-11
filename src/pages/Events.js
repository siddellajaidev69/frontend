import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES } from "../categories";

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // NEW: search + filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  useEffect(() => {
    api
      .get("/events")
      .then((res) => setEvents(res.data))
      .catch(() => setError("Could not load events. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading events...</div>;
  if (error) return <div className="container error">{error}</div>;

  const today = new Date().toISOString().slice(0, 10);

  // Keep only the events that match what the user typed / selected
  const shown = events
    .filter((e) => {
      const text = (e.name + " " + e.location).toLowerCase();
      return text.includes(search.toLowerCase());
    })
    .filter((e) => !category || e.category === category)
    .filter((e) => !upcomingOnly || e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date)); // earliest first

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>All Events</h2>
        {user && (
          <Link to="/add-event" className="btn btn-primary">
            + Add Event
          </Link>
        )}
      </div>

      <div className="filter-bar">
        <input
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label className="inline-label">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(e) => setUpcomingOnly(e.target.checked)}
          />
          Upcoming only
        </label>
      </div>

      {shown.length === 0 && <p>No events found.</p>}

      <div className="event-grid">
        {shown.map((event) => {
          const seatsLeft = event.maxParticipants - event.registeredCount;
          const isPast = event.date < today;
          return (
            <div className="card" key={event.id}>
              <h3>{event.name}</h3>
              {event.category && <span className="badge">{event.category}</span>}{" "}
              {isPast && <span className="badge badge-grey">Ended</span>}
              {!isPast && seatsLeft <= 0 && <span className="badge badge-red">Full</span>}
              <p><strong>Date:</strong> {event.date}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Seats left:</strong> {Math.max(seatsLeft, 0)} of {event.maxParticipants}</p>
              <Link className="btn btn-primary" to={`/events/${event.id}`}>
                View Details
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
