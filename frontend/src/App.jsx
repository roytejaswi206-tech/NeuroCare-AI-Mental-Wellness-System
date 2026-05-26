import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Disclaimer from "./components/Disclaimer";
import ApiStatus from "./components/ApiStatus";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MoodTracker from "./pages/MoodTracker";
import History from "./pages/History";
import Insights from "./pages/Insights";
import Journal from "./pages/Journal";
import Exercises from "./pages/Exercises";
import Resources from "./pages/Resources";
import ResourceCategory from "./pages/ResourceCategory";
import Emergency from "./pages/Emergency";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Disclaimer />
      <ApiStatus />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public resource pages */}
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:category" element={<ResourceCategory />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/exercises" element={<Exercises />} />

          {/* Protected pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track"
            element={
              <ProtectedRoute>
                <MoodTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <Journal />
              </ProtectedRoute>
            }
          />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
