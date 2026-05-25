// Small "Mood Insights" card on the dashboard.
// Reads `stats` (from /api/moods/stats) and `recent` (from /api/moods)
// and derives 2-3 plain-English observations.
// No ML here - just descriptive stats, easy to explain in viva.

import { getMoodMeta } from "../utils/moods";

function topMood(distribution = []) {
  if (!distribution.length) return null;
  return distribution.reduce((a, b) => (a.count > b.count ? a : b));
}

function avgStress(trend = []) {
  if (!trend.length) return null;
  return trend.reduce((s, d) => s + d.avg_stress, 0) / trend.length;
}

function peakStressDay(trend = []) {
  if (!trend.length) return null;
  return trend.reduce((a, b) => (a.avg_stress > b.avg_stress ? a : b));
}

function calmestDay(trend = []) {
  if (!trend.length) return null;
  return trend.reduce((a, b) => (a.avg_stress < b.avg_stress ? a : b));
}

function formatShortDate(dateStr) {
  // dateStr is YYYY-MM-DD
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export default function MoodInsights({ stats, recent = [] }) {
  const total = stats?.total_entries || 0;

  // Build a small list of insights. We add only the ones we can support
  // with the data we have, so nothing ever reads as a hollow placeholder.
  const insights = [];

  const top = topMood(stats?.distribution);
  if (top) {
    const meta = getMoodMeta(top.mood);
    insights.push({
      icon: meta.emoji,
      title: "Most common mood",
      detail: `${meta.label} - ${top.count} time${top.count === 1 ? "" : "s"} this week.`,
    });
  }

  const avg = avgStress(stats?.trend);
  if (avg !== null) {
    let comment = "in a comfortable range";
    if (avg >= 7) comment = "running high - schedule a real break";
    else if (avg >= 5) comment = "a bit elevated - small resets help";
    insights.push({
      icon: "📈",
      title: "Average stress (7d)",
      detail: `${avg.toFixed(1)} / 10 - ${comment}.`,
    });
  }

  const peak = peakStressDay(stats?.trend);
  const calm = calmestDay(stats?.trend);
  if (peak && calm && peak.date !== calm.date) {
    insights.push({
      icon: "📅",
      title: "Highest stress day",
      detail: `${formatShortDate(peak.date)} (${peak.avg_stress.toFixed(1)}/10). Calmest: ${formatShortDate(calm.date)}.`,
    });
  } else if (recent.length >= 3) {
    // Fallback insight when we only have one day of data.
    insights.push({
      icon: "📝",
      title: "Check-in streak",
      detail: `You've logged ${total} entries in the last 7 days. Keep it up.`,
    });
  }

  if (!insights.length) return null;

  return (
    <div className="nc-card mb-6">
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
        Mood insights
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {insights.map((ins, i) => (
          <li
            key={i}
            className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3"
          >
            <div className="text-xl mb-1" aria-hidden>{ins.icon}</div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {ins.title}
            </p>
            <p className="text-sm text-gray-800 mt-0.5 leading-snug">
              {ins.detail}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
