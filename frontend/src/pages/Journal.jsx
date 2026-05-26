// Mood reflection journal.
// Separate from mood check-ins - just a place to write what's on your mind.
// Uses the new /api/journal endpoints.

import { useEffect, useState } from "react";
import api from "../services/api";
import Spinner from "../components/Spinner";
import { formatDate } from "../utils/moods";

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const res = await api.get("/journal");
      setEntries(res.data || []);
    } catch (err) {
      setError(err.friendlyMessage || "Could not load your journal.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!content.trim()) {
      setError("Please write something before saving.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/journal", { title: title.trim(), content });
      setEntries((prev) => [res.data, ...prev]);
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err.friendlyMessage || "Could not save your entry.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    try {
      await api.delete(`/journal/${id}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.friendlyMessage || "Could not delete the entry.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
        Journal
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        A quiet place to write down what's on your mind. Separate from your daily mood check-in.
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Write form */}
      <form onSubmit={handleSubmit} className="nc-card mb-6">
        <label className="nc-label" htmlFor="j-title">
          Title <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <input
          id="j-title"
          type="text"
          className="nc-input mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="A short title"
        />
        <label className="nc-label" htmlFor="j-content">
          What's on your mind?
        </label>
        <textarea
          id="j-content"
          className="nc-input resize-none"
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={5000}
          placeholder="Write freely. No one but you will read this."
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">{content.length} / 5000</span>
          <button type="submit" className="nc-btn-primary" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center gap-2">
                <Spinner /> Saving…
              </span>
            ) : (
              "Save entry"
            )}
          </button>
        </div>
      </form>

      {/* Past entries */}
      <h2 className="font-medium text-gray-900 mb-3">Past entries</h2>
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-500">
          You haven't written anything yet. Even a sentence counts.
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="nc-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  {e.title && (
                    <h3 className="font-medium text-gray-900">{e.title}</h3>
                  )}
                  <p className="text-xs text-gray-400">{formatDate(e.created_at)}</p>
                </div>
                <button
                  onClick={() => handleDelete(e.id)}
                  className="text-xs text-rose-600 hover:underline shrink-0"
                  aria-label="Delete entry"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {e.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
