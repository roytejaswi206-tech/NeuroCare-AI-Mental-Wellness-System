import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { MOOD_OPTIONS, getMoodMeta } from "../utils/moods";
import Spinner from "../components/Spinner";

export default function MoodTracker() {
  const [mood, setMood] = useState("calm");
  const [stress, setStress] = useState(5);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/moods", {
        mood,
        stress_level: stress,
        note,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.friendlyMessage || "Could not save your check-in.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return <AnalysisScreen result={result} onAgain={() => { setResult(null); setNote(""); }} onDashboard={() => navigate("/dashboard")} />;
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          How are you feeling?
        </h1>
        <p className="text-sm text-gray-500">
          Pick a mood, rate your stress, and (optionally) write a short note.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood grid */}
        <div className="nc-card">
          <p className="nc-label">Your mood</p>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
            {MOOD_OPTIONS.map((m) => (
              <button
                type="button"
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  mood === m.value
                    ? "border-primary-400 bg-primary-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                aria-pressed={mood === m.value}
              >
                <div className="text-2xl" aria-hidden>{m.emoji}</div>
                <div className="text-xs mt-1 text-gray-700">{m.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Stress slider */}
        <div className="nc-card">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="stress" className="nc-label mb-0">Stress level</label>
            <span className="text-sm font-medium text-primary-700">
              {stress}/10
            </span>
          </div>
          <input
            id="stress"
            type="range"
            min="1"
            max="10"
            value={stress}
            onChange={(e) => setStress(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 (calm)</span>
            <span>10 (overwhelmed)</span>
          </div>
        </div>

        {/* Journal note */}
        <div className="nc-card">
          <label htmlFor="note" className="nc-label">
            Journal note <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="nc-input resize-none"
            placeholder="What's on your mind today?"
          />
          <p className="text-xs text-gray-500 mt-1">
            We run a simple sentiment check on this text (TextBlob + VADER) to
            personalise the suggestion.
          </p>
        </div>

        <button
          type="submit"
          className="nc-btn-primary w-full gap-2"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Spinner />
              Analyzing mood…
            </>
          ) : (
            "Save check-in"
          )}
        </button>
      </form>
    </div>
  );
}

function AnalysisScreen({ result, onAgain, onDashboard }) {
  const moodMeta = getMoodMeta(result.mood);
  const sentiment = result.sentiment || "neutral";
  const score = result.sentiment_score ?? 0;

  // Visual bar position: -1 → 0%, +1 → 100%, 0 → 50%.
  const barPct = Math.round(((score + 1) / 2) * 100);
  const sentColor = {
    positive: "bg-emerald-500",
    negative: "bg-rose-500",
    neutral:  "bg-slate-400",
  }[sentiment];
  const sentBg = {
    positive: "bg-emerald-50 text-emerald-700 border-emerald-200",
    negative: "bg-rose-50 text-rose-700 border-rose-200",
    neutral:  "bg-slate-50 text-slate-700 border-slate-200",
  }[sentiment];

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="nc-card text-center mb-4">
        <div className="text-3xl" aria-hidden>{moodMeta.emoji}</div>
        <h2 className="text-lg font-semibold text-gray-900 mt-1">
          Check-in saved
        </h2>
        <p className="text-sm text-gray-500">
          Logged as <strong className="text-gray-700">{moodMeta.label}</strong>{" "}
          with stress {result.stress_level}/10.
        </p>
      </div>

      {/* AI panel */}
      <div className="nc-card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">AI Analysis</h3>
          <span className="text-[10px] uppercase tracking-wide text-gray-400">
            TextBlob + VADER
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`rounded-lg border px-3 py-2 ${sentBg}`}>
            <p className="text-[11px] uppercase tracking-wide opacity-80">
              Detected emotion
            </p>
            <p className="text-base font-semibold capitalize">{sentiment}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              Sentiment score
            </p>
            <p className="text-base font-semibold text-gray-900">
              {score.toFixed(3)}
            </p>
          </div>
        </div>

        {/* Score bar */}
        <div className="mb-1">
          <div className="h-2 bg-gray-100 rounded-full relative overflow-hidden">
            <div
              className={`h-2 ${sentColor} rounded-full transition-all`}
              style={{ width: `${barPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>negative</span>
            <span>neutral</span>
            <span>positive</span>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-primary-50 border border-primary-100 px-3 py-3">
          <p className="text-[11px] uppercase tracking-wide text-primary-700 mb-1">
            Suggested tip
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {result.suggestion}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button onClick={onAgain} className="nc-btn-secondary">
          Log another
        </button>
        <button onClick={onDashboard} className="nc-btn-primary">
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
