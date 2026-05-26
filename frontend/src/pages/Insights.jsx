// Wellness Insights page.
// Reads /api/moods/stats and presents:
//   - Weekly emotional summary (top mood, trend direction, takeaway)
//   - Charts: stress trend, mood distribution, sentiment ratio donut
//   - Mental health awareness cards (general wording - no fake science)
//
// Falls back gracefully when the user has no data yet or the API is down.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import api from "../services/api";
import { getMoodMeta } from "../utils/moods";

const SENTIMENT_COLORS = {
  positive: "#10b981",  // emerald
  neutral:  "#94a3b8",  // slate
  negative: "#f43f5e",  // rose
};

export default function Insights() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/moods/stats")
      .then((res) => !cancelled && setStats(res.data))
      .catch((err) => !cancelled && setError(err.friendlyMessage || "Could not load insights."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading insights…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
        Wellness insights
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        A simple, honest look at your last 7 days of check-ins.
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {(!stats || stats.total_entries === 0) ? (
        <EmptyState />
      ) : (
        <>
          <WeeklySummary stats={stats} />
          <Charts stats={stats} />
        </>
      )}

      <AwarenessCards />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Weekly summary (top mood + trend direction + takeaway)
// ---------------------------------------------------------------------------
function WeeklySummary({ stats }) {
  const top =
    stats.distribution?.length
      ? stats.distribution.reduce((a, b) => (a.count > b.count ? a : b))
      : null;

  const avg =
    stats.trend?.length
      ? stats.trend.reduce((s, d) => s + d.avg_stress, 0) / stats.trend.length
      : null;

  const direction = stats.trend_direction || "stable";
  const directionMeta = {
    improving: { label: "improving", color: "text-emerald-700", arrow: "↓", bg: "bg-emerald-50 border-emerald-100" },
    worsening: { label: "rising",    color: "text-rose-700",    arrow: "↑", bg: "bg-rose-50 border-rose-100" },
    stable:    { label: "steady",    color: "text-gray-700",    arrow: "→", bg: "bg-gray-50 border-gray-100" },
  }[direction];

  const totalNotes =
    (stats.sentiment_ratio?.positive ?? 0) +
    (stats.sentiment_ratio?.neutral ?? 0) +
    (stats.sentiment_ratio?.negative ?? 0);
  const positivePct = totalNotes
    ? Math.round((stats.sentiment_ratio.positive / totalNotes) * 100)
    : null;

  // Build a one-line, honest takeaway based on the data.
  let takeaway;
  if (direction === "improving") {
    takeaway = "Stress is trending down this week. Keep doing what's working.";
  } else if (direction === "worsening") {
    takeaway = "Stress is trending up this week. Consider a real break today.";
  } else if (avg !== null && avg >= 7) {
    takeaway = "Your week sits in a high-stress range. Be gentle with yourself.";
  } else if (avg !== null && avg <= 3) {
    takeaway = "A calm week so far. Note what is helping so you can repeat it.";
  } else {
    takeaway = "A balanced week. Small daily resets help more than one big break.";
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="nc-card md:col-span-2 bg-primary-50 border-primary-100">
        <h2 className="text-sm font-medium text-primary-700 uppercase tracking-wide mb-2">
          Weekly emotional summary
        </h2>
        <p className="text-base text-gray-800 leading-relaxed">
          {takeaway}
        </p>
      </div>

      <div className={`nc-card ${directionMeta.bg}`}>
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
          Stress trend
        </p>
        <p className={`text-lg font-semibold capitalize ${directionMeta.color}`}>
          {directionMeta.arrow} {directionMeta.label}
        </p>
      </div>

      <div className="nc-card">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
          Most common mood
        </p>
        {top ? (
          <p className="text-lg font-semibold text-gray-900">
            <span className="mr-1" aria-hidden>{getMoodMeta(top.mood).emoji}</span>
            {getMoodMeta(top.mood).label}
          </p>
        ) : (
          <p className="text-gray-500 text-sm">No data yet.</p>
        )}
      </div>

      <div className="nc-card">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
          Average stress
        </p>
        <p className="text-lg font-semibold text-gray-900">
          {avg !== null ? `${avg.toFixed(1)} / 10` : "–"}
        </p>
      </div>

      <div className="nc-card">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
          Positive notes
        </p>
        <p className="text-lg font-semibold text-gray-900">
          {positivePct !== null ? `${positivePct}%` : "–"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {totalNotes ? `${totalNotes} note${totalNotes === 1 ? "" : "s"} analysed` : "Add a journal note to your check-ins."}
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------
function Charts({ stats }) {
  const sentimentData = stats.sentiment_ratio
    ? Object.entries(stats.sentiment_ratio)
        .map(([name, value]) => ({ name, value }))
        .filter((d) => d.value > 0)
    : [];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <div className="nc-card">
        <h2 className="font-medium text-gray-900 mb-2">Stress trend (last 7 days)</h2>
        {stats.trend?.length ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="date" fontSize={11} tick={{ fill: "#6b7280" }} />
                <YAxis domain={[0, 10]} fontSize={11} tick={{ fill: "#6b7280" }} />
                <Tooltip />
                <Line type="monotone" dataKey="avg_stress" stroke="#4663dc" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart />
        )}
      </div>

      <div className="nc-card">
        <h2 className="font-medium text-gray-900 mb-2">Mood distribution</h2>
        {stats.distribution?.length ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="mood" fontSize={11} tick={{ fill: "#6b7280" }} />
                <YAxis allowDecimals={false} fontSize={11} tick={{ fill: "#6b7280" }} />
                <Tooltip />
                <Bar dataKey="count" fill="#7fb8ad" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart />
        )}
      </div>

      <div className="nc-card lg:col-span-2">
        <h2 className="font-medium text-gray-900 mb-2">Note sentiment ratio</h2>
        {sentimentData.length ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  label={(d) => `${d.name} (${d.value})`}
                >
                  {sentimentData.map((d) => (
                    <Cell key={d.name} fill={SENTIMENT_COLORS[d.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Add a journal note to your check-ins to see how the AI reads your tone.
          </p>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Mental health awareness cards (general wording, not medical claims)
// ---------------------------------------------------------------------------
const AWARENESS = [
  { icon: "📚", title: "Academic pressure",
    text: "Many students notice higher stress around exams and deadlines. Small breaks between study sessions help more than one big break." },
  { icon: "😴", title: "Sleep & mood",
    text: "Sleep quality often affects how the next day feels. A regular wake-up time supports a steadier mood." },
  { icon: "📝", title: "Journaling habit",
    text: "Writing down what's on your mind can help you notice patterns and feel less stuck in your head." },
  { icon: "📱", title: "Screen fatigue",
    text: "Long screen sessions can leave you mentally drained. Short breaks looking away from the screen help your eyes and focus." },
  { icon: "🤝", title: "Talking helps",
    text: "Sharing how you feel with a friend, family member, or counsellor often eases the weight of it." },
  { icon: "🚶", title: "Movement matters",
    text: "Even a short walk supports your mood. You do not need a full workout for the benefit." },
];

function AwarenessCards() {
  return (
    <section className="mt-2">
      <h2 className="font-medium text-gray-900 mb-3">Awareness & wellbeing</h2>
      <p className="text-xs text-gray-500 mb-3">
        General observations to keep in mind. Not medical advice.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {AWARENESS.map((a) => (
          <div key={a.title} className="nc-card">
            <div className="text-xl mb-1" aria-hidden>{a.icon}</div>
            <h3 className="font-medium text-gray-900 mb-1">{a.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{a.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Empty states
// ---------------------------------------------------------------------------
function EmptyState() {
  return (
    <div className="nc-card text-center py-8 mb-6">
      <div className="text-3xl mb-2">🌱</div>
      <p className="text-sm text-gray-600 mb-3">
        No check-ins yet this week. Log a few moods to see your insights here.
      </p>
      <Link to="/track" className="nc-btn-primary">Log your first mood</Link>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-56 flex items-center justify-center text-sm text-gray-400">
      Not enough data yet.
    </div>
  );
}
