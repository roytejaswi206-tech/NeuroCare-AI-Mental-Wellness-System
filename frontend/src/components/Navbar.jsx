import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, PencilLine, BarChart3, BookOpen, Wind,
  HeartHandshake, LifeBuoy, Home as HomeIcon, Menu, X, Brain,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = user
    ? [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/track",     label: "Track",     icon: PencilLine },
        { to: "/insights",  label: "Insights",  icon: BarChart3 },
        { to: "/journal",   label: "Journal",   icon: BookOpen },
        { to: "/exercises", label: "Exercises", icon: Wind },
        { to: "/resources", label: "Resources", icon: HeartHandshake },
        { to: "/emergency", label: "Help",      icon: LifeBuoy },
      ]
    : [
        { to: "/",          label: "Home",      icon: HomeIcon },
        { to: "/exercises", label: "Exercises", icon: Wind },
        { to: "/resources", label: "Resources", icon: HeartHandshake },
        { to: "/emergency", label: "Help",      icon: LifeBuoy },
      ];

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "text-primary-700 bg-primary-50"
        : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
    }`;

  return (
    <nav className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <NavLink
            to={user ? "/dashboard" : "/"}
            className="flex items-center gap-2 font-semibold text-primary-700"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <Brain size={18} />
            </span>
            <span>NeuroCare</span>
          </NavLink>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === "/"}>
                <l.icon size={15} aria-hidden />
                <span>{l.label}</span>
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
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden pb-3 space-y-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={linkClass}
                end={l.to === "/"}
              >
                <l.icon size={15} aria-hidden />
                <span>{l.label}</span>
              </NavLink>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left nc-btn-secondary mt-2"
              >
                Log out
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className="block w-full nc-btn-primary mt-2 text-center"
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
