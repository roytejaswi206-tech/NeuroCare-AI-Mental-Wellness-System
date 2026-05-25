import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
      <div className="nc-card">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Sign in to continue tracking your wellness.
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="nc-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="nc-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="nc-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="nc-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="nc-btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="my-5 flex items-center text-xs text-gray-400">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <GoogleSignInButton onError={setError} />

        <p className="mt-6 text-sm text-center text-gray-600">
          New to NeuroCare?{" "}
          <Link to="/register" className="nc-link">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
