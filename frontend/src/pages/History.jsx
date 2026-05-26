import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "../services/api";
import { getMoodMeta, formatDate } from "../utils/moods";

export default function History() {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [moodsRes, statsRes] = await Promise.all([
          api.get("/moods?limit=50"),
          api.get("/moods/stats"),
        ]);
        setEntries(moodsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
        Your mood history
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Charts cover the last 7 days. The list below shows your full history.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Stress trend */}
        <div className="nc-card">
          <h2 className="font-medium text-gray-900 mb-2">Stress trend (last 7 days)</h2>
          {stats?.trend?.length ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="date" fontSize={11} tick={{ fill: "#6b7280" }} />
                  <YAxis domain={[0, 10]} fontSize={11} tick={{ fill: "#6b7280" }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avg_stress"
                    stroke="#6C63FF"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#6C63FF" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* Mood distribution */}
        <div className="nc-card">
          <h2 className="font-medium text-gray-900 mb-2">Mood distribution (last 7 days)</h2>
          {stats?.distribution?.length ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="mood" fontSize={11} tick={{ fill: "#6b7280" }} />
                  <YAxis allowDecimals={false} fontSize={11} tick={{ fill: "#6b7280" }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart />
          )}
        </div>
      </div>

      {/* List of entries */}
      <div className="nc-card">
        <h2 className="font-medium text-gray-900 mb-3">All check-ins</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">No check-ins yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {entries.map((m) => {
              const meta = getMoodMeta(m.mood);
              return (
                <li key={m.id} className="py-3 flex items-start gap-3">
                  <span className="text-2xl" aria-hidden>{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        Stress {m.stress_level}/10
                      </span>
                      {m.sentiment && (
                        <span className="text-xs text-gray-500">
                          · Note: {m.sentiment}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">
                        {formatDate(m.created_at)}
                      </span>
                    </div>
                    {m.note && (
                      <p className="text-sm text-gray-700 mt-1">{m.note}</p>
                    )}
                    {m.suggestion && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        Suggestion: {m.suggestion}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-56 flex items-center justify-center text-sm text-gray-400">
      Not enough data yet. Log a few check-ins to see this chart fill up.
    </div>
  );
}
