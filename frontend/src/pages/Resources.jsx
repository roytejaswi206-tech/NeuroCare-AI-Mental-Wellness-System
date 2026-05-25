import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { RESOURCES } from "../data/resources";

const CATEGORY_META = {
  anxiety:  { label: "Anxiety",        emoji: "🌧️", color: "bg-blue-50 border-blue-100" },
  stress:   { label: "Daily Stress",   emoji: "🌿", color: "bg-emerald-50 border-emerald-100" },
  panic:    { label: "Panic Attacks",  emoji: "🌊", color: "bg-indigo-50 border-indigo-100" },
  sleep:    { label: "Sleep",          emoji: "🌙", color: "bg-violet-50 border-violet-100" },
  burnout:  { label: "Burnout",        emoji: "🔥", color: "bg-amber-50 border-amber-100" },
};

export default function Resources() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/resources")
      .then((res) => {
        if (cancelled) return;
        setItems(res.data?.length ? res.data : RESOURCES);
      })
      .catch(() => {
        if (cancelled) return;
        // Backend unreachable - use bundled content so the page still works.
        setItems(RESOURCES);
        setOffline(true);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
        Wellness resources
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Short, plain explanations and practical tips for common wellness topics.
      </p>

      {offline && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Showing locally bundled tips (the API is not reachable). Start the
          backend to load fresh content.
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((r) => {
            const meta = CATEGORY_META[r.category] || {
              label: r.category,
              emoji: "🧠",
              color: "bg-gray-50 border-gray-100",
            };
            return (
              <Link
                key={r.id}
                to={`/resources/${r.category}`}
                className={`nc-card hover:shadow-md transition-shadow ${meta.color}`}
              >
                <div className="text-2xl mb-2" aria-hidden>{meta.emoji}</div>
                <h2 className="font-medium text-gray-900 mb-1">{r.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                  {r.description}
                </p>
                <p className="mt-3 text-xs text-primary-700">Read more →</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
