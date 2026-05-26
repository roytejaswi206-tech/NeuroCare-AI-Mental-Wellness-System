// Lightweight backend-status banner.
// Pings /api/health on mount; if it fails or stays cold, shows a clear,
// non-scary banner so the user knows what's happening (Railway free tier
// sleeps after inactivity and takes ~10-20s to wake up).
//
// Auto-dismisses once a successful response comes back.

import { useEffect, useState } from "react";
import api from "../services/api";

export default function ApiStatus() {
  // status: "checking" | "ok" | "waking" | "down"
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;

    async function ping(attempt = 1) {
      try {
        await api.get("/health", { timeout: 8000 });
        if (!cancelled) setStatus("ok");
      } catch {
        if (cancelled) return;
        if (attempt < 4) {
          // Backend may be cold-starting on Railway. Try again with backoff.
          setStatus("waking");
          setTimeout(() => ping(attempt + 1), 4000);
        } else {
          setStatus("down");
        }
      }
    }

    ping();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking" || status === "ok") return null;

  const isDown = status === "down";

  return (
    <div
      className={`border-b text-center px-4 py-2 text-xs sm:text-sm ${
        isDown
          ? "bg-rose-50 border-rose-200 text-rose-800"
          : "bg-amber-50 border-amber-200 text-amber-900"
      }`}
      role="status"
    >
      {isDown ? (
        <>
          <span className="font-medium">Backend is unreachable.</span>{" "}
          Some features (mood saving, history) will not work right now. The
          public pages (Resources, Emergency, Exercises) still work.
        </>
      ) : (
        <>
          <span className="font-medium">Backend is waking up...</span>{" "}
          Railway free instances sleep after inactivity. This usually takes 10-20 seconds.
        </>
      )}
    </div>
  );
}
