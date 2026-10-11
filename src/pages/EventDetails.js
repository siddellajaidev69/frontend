import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false); // NEW

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch(() => setError("Event not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const loadEvent = () => {
    api.get(`/events/${id}`).then((res) => setEvent(res.data));
  };

  // NEW: check if this user is already registered for this event
  useEffect(() => {
    if (!user) return;
    api.get(`/registrations/user/${user.id}`).then((res) => {
      setAlreadyRegistered(res.data.some((r) => String(r.event.id) === String(id)));
    });
  }, [user, id]);

  const handleRegister = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setMessage("");
    setError("");

    api
      .post("/registrations", { userId: user.id, eventId: event.id })
      .then(() => {
        setMessage("You have successfully registered for this event!");
        setAlreadyRegistered(true);
        loadEvent(); // refresh the seats left
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Registration failed.";
        setError(msg);
      });
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error && !event) return <div className="container error">{error}</div>;

  const seatsLeft = event.maxParticipants - event.registeredCount;
  const isPast = event.date < new Date().toISOString().slice(0, 10);

  return (
    <div className="container">
      <div className="card">
        <h2>{event.name}</h2>
        {event.category && <span className="badge">{event.category}</span>}
        <p>{event.description}</p>
        <p><strong>Date:</strong> {event.date}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Seats left:</strong> {Math.max(seatsLeft, 0)} of {event.maxParticipants}</p>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <button
          className="btn btn-primary"
          onClick={handleRegister}
          disabled={user && (alreadyRegistered || isPast || seatsLeft <= 0)}
        >
          {!user && "Login to Register"}
          {user && alreadyRegistered && "Already Registered"}
          {user && !alreadyRegistered && isPast && "Event Ended"}
          {user && !alreadyRegistered && !isPast && seatsLeft <= 0 && "Event Full"}
          {user && !alreadyRegistered && !isPast && seatsLeft > 0 && "Register for this Event"}
        </button>
      </div>
    </div>
  );
}
