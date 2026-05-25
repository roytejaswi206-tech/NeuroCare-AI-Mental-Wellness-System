import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = user
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/track", label: "Track Mood" },
        { to: "/history", label: "History" },
        { to: "/resources", label: "Resources" },
        { to: "/emergency", label: "Emergency" },
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/resources", label: "Resources" },
        { to: "/emergency", label: "Emergency" },
      ];

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "text-primary-700 bg-primary-50"
        : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
    }`;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <NavLink
            to={user ? "/dashboard" : "/"}
            className="flex items-center gap-2 font-semibold text-primary-700"
          >
            <span className="text-xl">🧠</span>
            <span>NeuroCare</span>
          </NavLink>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === "/"}>
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="ml-2 nc-btn-secondary text-sm"
              >
                Log out
              </button>
            ) : (
              <NavLink to="/login" className="ml-2 nc-btn-primary text-sm">
                Sign in
              </NavLink>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-3 space-y-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={linkClass}
                end={l.to === "/"}
              >
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left nc-btn-secondary"
              >
                Log out
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className="w-full nc-btn-primary"
              >
                Sign in
              </NavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
