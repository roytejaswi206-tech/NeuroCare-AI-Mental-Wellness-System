// Emergency Help page. Lists Indian + international helplines and gives
// quick calming steps. All information is publicly listed / not medical advice.

const HELPLINES = [
  {
    name: "iCall (India)",
    desc: "Free psychosocial helpline by TISS. Multiple languages, weekdays.",
    phone: "9152987821",
    url: "https://icallhelpline.org",
  },
  {
    name: "Vandrevala Foundation (India)",
    desc: "24x7 free mental health helpline.",
    phone: "1860-2662-345",
    url: "https://vandrevalafoundation.com",
  },
  {
    name: "AASRA (India)",
    desc: "24x7 helpline for those in emotional distress.",
    phone: "9820466726",
    url: "http://www.aasra.info",
  },
  {
    name: "Tele MANAS (India)",
    desc: "Government of India tele-mental health service.",
    phone: "14416",
    url: "https://telemanas.mohfw.gov.in",
  },
  {
    name: "Find a Helpline (International)",
    desc: "Directory of free, confidential helplines around the world.",
    phone: null,
    url: "https://findahelpline.com",
  },
];

export default function Emergency() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-rose-900 mb-1">
          If you are in distress, you are not alone.
        </h1>
        <p className="text-sm text-rose-800">
          If you or someone you know is in immediate danger, please call your
          local emergency number (in India: <strong>112</strong>) or go to the
          nearest hospital. The helplines below offer free, confidential
          support.
        </p>
      </div>

      <h2 className="font-semibold text-gray-900 mb-3">Helplines</h2>
      <ul className="space-y-3 mb-8">
        {HELPLINES.map((h) => (
          <li key={h.name} className="nc-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-medium text-gray-900">{h.name}</p>
              <p className="text-sm text-gray-600">{h.desc}</p>
              {h.phone && (
                <p className="text-sm mt-1">
                  <a href={`tel:${h.phone}`} className="nc-link">📞 {h.phone}</a>
                </p>
              )}
            </div>
            <a
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              className="nc-btn-secondary self-start sm:self-center"
            >
              Visit
            </a>
          </li>
        ))}
      </ul>

      <h2 className="font-semibold text-gray-900 mb-3">Calming steps you can try right now</h2>
      <ol className="nc-card space-y-3 text-sm text-gray-700 list-decimal list-inside">
        <li>
          <strong>Slow your breath.</strong> Breathe in through your nose for 4
          seconds, hold for 4 seconds, breathe out for 4 seconds. Repeat.
        </li>
        <li>
          <strong>Ground yourself.</strong> Look around and name 5 things you
          can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can
          taste.
        </li>
        <li>
          <strong>Find a person.</strong> If you can, sit near someone you
          trust. You don't need to explain anything.
        </li>
        <li>
          <strong>Drink some water.</strong> Cold water on the wrists or face
          can help your body settle.
        </li>
        <li>
          <strong>Call a helpline.</strong> The numbers above are free. You can
          stay anonymous.
        </li>
      </ol>
    </div>
  );
}
