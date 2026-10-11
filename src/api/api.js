import axios from "axios";

// All backend API calls go through this one axios instance.
// If you deploy the backend somewhere else, just change this one line.
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
