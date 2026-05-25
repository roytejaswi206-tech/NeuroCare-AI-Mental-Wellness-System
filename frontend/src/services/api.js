// Axios wrapper around the Flask backend.
// Attaches the Flask JWT (issued by /api/auth/firebase after Firebase sign-in)
// to every request so /moods etc. can identify the user.

import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nc_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.error ||
      err.message ||
      "Something went wrong. Please try again.";
    err.friendlyMessage = msg;
    return Promise.reject(err);
  }
);

export default api;
