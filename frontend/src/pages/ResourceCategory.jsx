import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { resourcesByCategory } from "../data/resources";

export default function ResourceCategory() {
  const { category } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setOffline(false);

    api
      .get(`/resources/${category}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.length ? res.data : resourcesByCategory(category);
        setItems(data);
      })
      .catch(() => {
        if (cancelled) return;
        setItems(resourcesByCategory(category));
        setOffline(true);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link to="/resources" className="text-sm nc-link">← Back to resources</Link>

      {offline && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Showing locally bundled tips (the API is not reachable).
        </div>
      )}

      {loading && <div className="mt-6 text-gray-500">Loading…</div>}

      {!loading && items.length === 0 && (
        <p className="mt-6 text-gray-500 text-sm">Nothing here yet.</p>
      )}

      <div className="space-y-6 mt-4">
        {items.map((r) => (
          <article key={r.id} className="nc-card">
            {r.image && (
              <img
                src={r.image}
                alt=""
                loading="lazy"
                className="w-full h-40 sm:h-56 object-cover rounded-lg mb-4"
              />
            )}
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              {r.title}
            </h1>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {r.description}
            </p>

            {r.tips?.length > 0 && (
              <>
                <h2 className="font-medium text-gray-900 mb-2">Helpful tips</h2>
                <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                  {r.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </>
            )}

            <BreathingExercise />
          </article>
        ))}
      </div>
    </div>
  );
}

function BreathingExercise() {
  return (
    <div className="mt-6 bg-primary-50 border border-primary-100 rounded-lg p-4">
      <h3 className="font-medium text-primary-700 mb-1">Quick breathing exercise</h3>
      <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
        <li>Breathe in slowly through your nose for 4 seconds.</li>
        <li>Hold your breath gently for 7 seconds.</li>
        <li>Breathe out through your mouth for 8 seconds.</li>
        <li>Repeat 3 to 4 times.</li>
      </ol>
    </div>
  );
}
