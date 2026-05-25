import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  function validate() {
    if (name.trim().length < 2) return "Name must be at least 2 characters.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email, password);
      setSuccess("Account created. Redirecting…");
      // Small delay so the success message is visible.
      setTimeout(() => navigate("/dashboard", { replace: true }), 600);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
      <div className="nc-card">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
          Create your account
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          A simple sign-up to start tracking your wellness.
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="nc-label" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              className="nc-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              autoComplete="name"
            />
          </div>
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
              minLength={6}
              autoComplete="new-password"
            />
            <p className="text-xs text-gray-500 mt-1">At least 6 characters.</p>
          </div>
          <button
            type="submit"
            className="nc-btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="my-5 flex items-center text-xs text-gray-400">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <GoogleSignInButton onError={setError} />

        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="nc-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
