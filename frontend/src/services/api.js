// Axios wrapper around the Flask backend.
// Attaches the Flask JWT (issued by /api/auth/firebase after Firebase sign-in)
// to every request so /moods etc. can identify the user.

import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// If the production build ever falls back to the localhost URL the browser
// will block it as mixed content from an https:// page. Warn loudly so the
// misconfiguration is obvious in the deployed console.
if (
  import.meta.env.PROD &&
  (!import.meta.env.VITE_API_BASE_URL ||
    /localhost|127\.0\.0\.1/.test(import.meta.env.VITE_API_BASE_URL))
) {
  // eslint-disable-next-line no-console
  console.error(
    "VITE_API_BASE_URL is missing or points to localhost in the production " +
      "build. Set it to your Render backend URL (e.g. " +
      "https://neurocare-backend.onrender.com/api) in Vercel → Settings → " +
      "Environment Variables, then redeploy."
  );
}

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
