import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function MyRegistrations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // NEW: cancel a registration
  const handleCancel = (id) => {
    if (!window.confirm("Cancel this registration?")) return;
    api
      .delete(`/registrations/${id}`)
      .then(() => setRegistrations(registrations.filter((r) => r.id !== id)))
      .catch(() => setError("Could not cancel the registration."));
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    api
      .get(`/registrations/user/${user.id}`)
      .then((res) => setRegistrations(res.data))
      .catch(() => setError("Could not load your registrations."))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h2>My Registrations</h2>
      {error && <p className="error">{error}</p>}

      {registrations.length === 0 && <p>You haven't registered for any events yet.</p>}

      <table className="table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Date</th>
            <th>Location</th>
            <th>Registered On</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => (
            <tr key={reg.id}>
              <td>{reg.event.name}</td>
              <td>{reg.event.date}</td>
              <td>{reg.event.location}</td>
              <td>{new Date(reg.registrationDate).toLocaleString()}</td>
              <td>
                <button className="btn-link danger" onClick={() => handleCancel(reg.id)}>
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
