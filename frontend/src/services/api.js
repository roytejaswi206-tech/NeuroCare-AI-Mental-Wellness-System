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
    // Distinguish network/CORS failures from real server errors so the UI
    // can show a useful message instead of just "Network Error".
    let friendly = "Something went wrong. Please try again.";

    if (err.response) {
      // Backend responded with an error status (400, 401, 500, ...).
      friendly = err.response.data?.error || `Server error (${err.response.status}).`;
    } else if (err.code === "ECONNABORTED") {
      friendly = "The server took too long to respond. It may be waking up - try again in a moment.";
    } else if (err.message === "Network Error") {
      // Most likely cause: backend cold start on Railway, or CORS_ORIGINS not
      // including this frontend URL. Either way, the user can't tell.
      friendly =
        "Could not reach the server. It may be starting up after a period of " +
        "inactivity - please wait 10 seconds and try again.";
    } else if (err.message) {
      friendly = err.message;
    }

    err.friendlyMessage = friendly;
    return Promise.reject(err);
  }
);

export default api;
