import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getMoodMeta, formatDate } from "../utils/moods";
import { getDailyTip } from "../utils/dailyTip";
import MoodInsights from "../components/MoodInsights";
import Spinner from "../components/Spinner";

export default function Dashboard() {
  const { user } = useAuth();
  const [latest, setLatest] = useState(null);
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  async function loadAll() {
    try {
      const [moodsRes, statsRes] = await Promise.all([
        api.get("/moods?limit=5"),
        api.get("/moods/stats"),
      ]);
      setRecent(moodsRes.data);
      setLatest(moodsRes.data[0] || null);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleLoadDemo() {
    setSeeding(true);
    try {
      await api.post("/moods/seed-demo");
      await loadAll();
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading…</div>;
  }

  const hasData = recent.length > 0;
  const dailyTip = getDailyTip();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Hi {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-sm text-gray-500">
          Here's a quick look at how you've been feeling.
        </p>
      </div>

      {/* Daily wellness tip strip - rotates each day, same for everyone */}
      <div className="mb-6 rounded-xl border border-teal-200 bg-teal-soft px-4 py-3 flex items-start gap-3">
        <span className="text-2xl shrink-0" aria-hidden>{dailyTip.icon}</span>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-teal-700 font-medium mb-0.5">
            Today's wellness tip
          </p>
          <p className="text-sm text-gray-800 leading-snug">{dailyTip.text}</p>
        </div>
      </div>

      {/* Top row: latest mood + suggestion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="nc-card lg:col-span-2">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Latest check-in
          </h2>
          {latest ? (
            <LatestMoodCard mood={latest} />
          ) : (
            <EmptyState onSeed={handleLoadDemo} seeding={seeding} />
          )}
        </div>
        <div className="nc-card bg-primary-50 border-primary-100">
          <h2 className="text-sm font-medium text-primary-700 uppercase tracking-wide mb-2">
            Today's tip
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {latest?.suggestion ||
              "Try a short check-in. Even a 30-second pause helps you notice how you really feel."}
          </p>
          <Link to="/track" className="mt-4 nc-btn-primary inline-flex">
            New check-in
          </Link>
        </div>
      </div>

      {hasData && <MoodInsights stats={stats} recent={recent} />}

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Check-ins (7d)" value={stats?.total_entries ?? 0} />
        <StatCard
          label="Avg. stress (7d)"
          value={
            stats?.trend?.length
              ? (
                  stats.trend.reduce((s, d) => s + d.avg_stress, 0) /
                  stats.trend.length
                ).toFixed(1)
              : "–"
          }
        />
        <StatCard
          label="Most common mood"
          value={
            stats?.distribution?.length
              ? getMoodMeta(
                  stats.distribution.reduce((a, b) =>
                    a.count > b.count ? a : b
                  ).mood
                ).label
              : "–"
          }
        />
        <StatCard label="Active days" value={stats?.trend?.length ?? 0} />
      </div>

      {/* Recent entries */}
      <div className="nc-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium text-gray-900">Recent check-ins</h2>
          {hasData && (
            <Link to="/history" className="text-sm nc-link">View all</Link>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-500">
            You haven't logged anything yet.{" "}
            <Link to="/track" className="nc-link">Add your first check-in</Link>.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((m) => {
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
                      <span className="text-xs text-gray-400 ml-auto">
                        {formatDate(m.created_at)}
                      </span>
                    </div>
                    {m.note && (
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">{m.note}</p>
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

function LatestMoodCard({ mood }) {
  const meta = getMoodMeta(mood.mood);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="text-5xl" aria-hidden>{meta.emoji}</div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${meta.color}`}>
            {meta.label}
          </span>
          <span className="text-xs text-gray-500">
            Stress {mood.stress_level}/10
          </span>
          {mood.sentiment && (
            <span className="text-xs text-gray-500">
              · Note sentiment: <strong className="text-gray-700">{mood.sentiment}</strong>
            </span>
          )}
        </div>
        {mood.note && (
          <p className="text-sm text-gray-700 mt-2">{mood.note}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">{formatDate(mood.created_at)}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="nc-card">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg sm:text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function EmptyState({ onSeed, seeding }) {
  return (
    <div className="text-center py-4">
      <p className="text-sm text-gray-500 mb-3">
        No check-ins yet. Log how you're feeling to get a personal suggestion,
        or load a week of sample entries to see how the charts work.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        <Link to="/track" className="nc-btn-primary">Log your mood</Link>
        <button
          type="button"
          onClick={onSeed}
          disabled={seeding}
          className="nc-btn-secondary gap-2"
        >
          {seeding ? (
            <>
              <Spinner /> Loading demo data…
            </>
          ) : (
            "Load demo data"
          )}
        </button>
      </div>
    </div>
  );
}
