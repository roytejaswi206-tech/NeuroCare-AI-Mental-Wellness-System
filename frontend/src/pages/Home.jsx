import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    title: "Daily Mood Check-in",
    desc: "Log how you feel in seconds with our simple mood tracker.",
    icon: "📝",
  },
  {
    title: "AI Sentiment Analysis",
    desc: "Optional journal notes are analysed using TextBlob + VADER to gauge tone.",
    icon: "🤖",
  },
  {
    title: "Wellness Suggestions",
    desc: "Small, gentle suggestions based on your mood and stress level.",
    icon: "💡",
  },
  {
    title: "History & Trends",
    desc: "See your last 7 days as simple charts so you can spot patterns.",
    icon: "📊",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <span className="inline-block text-xs font-medium text-primary-700 bg-primary-100 px-3 py-1 rounded-full mb-4">
            Mental Wellness Support
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Take a quiet moment for yourself.
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-base sm:text-lg">
            NeuroCare is a simple wellness companion. Track your mood,
            write a short note, and get a gentle suggestion - all in one calm
            place.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {user ? (
              <Link to="/dashboard" className="nc-btn-primary">
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="nc-btn-primary">
                  Create an account
                </Link>
                <Link to="/login" className="nc-btn-secondary">
                  Sign in
                </Link>
              </>
            )}
            <Link to="/resources" className="nc-btn-secondary">
              Browse Resources
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 text-center">
          What you can do
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="nc-card text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-medium text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
            How it works
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            NeuroCare uses simple sentiment analysis on the notes you write to
            offer gentle wellness suggestions. It does <strong>not</strong>{" "}
            diagnose anything and is <strong>not</strong> a replacement for
            talking to a counsellor, doctor, or someone you trust.
          </p>
        </div>
      </section>
    </div>
  );
}
