// Calming Exercises page.
// Three small interactive helpers:
//   1) Animated 4-7-8 breathing circle (start/stop)
//   2) 5-4-3-2-1 grounding walkthrough (step-by-step)
//   3) Quick reset checklist (static)
// All pure frontend - no backend calls.

import { useEffect, useRef, useState } from "react";

export default function Exercises() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
        Calming exercises
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Short, gentle resets you can try whenever your mind feels busy.
      </p>

      <BreathingCircle />
      <GroundingWalkthrough />
      <QuickReset />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4-7-8 breathing circle
// ---------------------------------------------------------------------------
const PHASES = [
  { name: "Breathe in", seconds: 4, scale: 1.0 },
  { name: "Hold",       seconds: 7, scale: 1.0 },
  { name: "Breathe out", seconds: 8, scale: 0.6 },
];

function BreathingCircle() {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds);
  const [cycles, setCycles] = useState(0);
  const tickRef = useRef(null);

  useEffect(() => {
    if (!running) {
      clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        // Move to next phase
        setPhaseIdx((i) => {
          const next = (i + 1) % PHASES.length;
          if (next === 0) setCycles((c) => c + 1);
          return next;
        });
        return null;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [running]);

  // When the phase changes, reset the seconds counter.
  useEffect(() => {
    setSecondsLeft(PHASES[phaseIdx].seconds);
  }, [phaseIdx]);

  function start() {
    setPhaseIdx(0);
    setSecondsLeft(PHASES[0].seconds);
    setCycles(0);
    setRunning(true);
  }
  function stop() {
    setRunning(false);
  }

  const phase = PHASES[phaseIdx];
  // Animate scale via inline style transitions.
  const scale = running ? phase.scale : 0.8;
  const duration = running ? phase.seconds : 0.6;

  return (
    <section className="nc-card mb-6">
      <h2 className="font-medium text-gray-900 mb-1">4-7-8 breathing</h2>
      <p className="text-xs text-gray-500 mb-4">
        Inhale 4 seconds, hold 7 seconds, exhale 8 seconds. Slows your nervous
        system. Try a few cycles.
      </p>

      <div className="flex flex-col items-center py-2">
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
          {/* Outer soft halo */}
          <div className="absolute inset-0 rounded-full bg-primary-50" />
          {/* Animated inner circle */}
          <div
            className="rounded-full bg-primary-200/70 border border-primary-300 transition-transform"
            style={{
              width: "100%",
              height: "100%",
              transform: `scale(${scale})`,
              transitionDuration: `${duration}s`,
              transitionTimingFunction: "ease-in-out",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-primary-700">{phase.name}</p>
            {running && (
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {secondsLeft ?? phase.seconds}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {!running ? (
            <button onClick={start} className="nc-btn-primary">Start</button>
          ) : (
            <button onClick={stop} className="nc-btn-secondary">Stop</button>
          )}
        </div>

        {cycles > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            Completed cycles: <strong className="text-gray-700">{cycles}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 5-4-3-2-1 grounding walkthrough
// ---------------------------------------------------------------------------
const GROUND_STEPS = [
  { count: 5, sense: "see",   prompt: "Look around and name 5 things you can see." },
  { count: 4, sense: "touch", prompt: "Name 4 things you can touch right now." },
  { count: 3, sense: "hear",  prompt: "Name 3 sounds you can hear." },
  { count: 2, sense: "smell", prompt: "Name 2 things you can smell." },
  { count: 1, sense: "taste", prompt: "Name 1 thing you can taste." },
];

function GroundingWalkthrough() {
  const [stepIdx, setStepIdx] = useState(0);
  const step = GROUND_STEPS[stepIdx];
  const done = stepIdx >= GROUND_STEPS.length;

  function next() {
    setStepIdx((i) => i + 1);
  }
  function reset() {
    setStepIdx(0);
  }

  return (
    <section className="nc-card mb-6">
      <h2 className="font-medium text-gray-900 mb-1">5-4-3-2-1 grounding</h2>
      <p className="text-xs text-gray-500 mb-4">
        Pulls your mind back to the present. Useful when thoughts spiral.
      </p>

      {!done ? (
        <div className="text-center py-4">
          <div className="text-5xl font-semibold text-primary-600 mb-2">
            {step.count}
          </div>
          <p className="text-base text-gray-800 mb-1 capitalize">{step.sense}</p>
          <p className="text-sm text-gray-600 mb-4">{step.prompt}</p>
          <button onClick={next} className="nc-btn-primary">
            {stepIdx === GROUND_STEPS.length - 1 ? "Finish" : "Next"}
          </button>
          <div className="mt-3 flex justify-center gap-1">
            {GROUND_STEPS.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i <= stepIdx ? "bg-primary-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-3xl mb-2">🌿</div>
          <p className="text-sm text-gray-700 mb-3">
            Nicely done. Notice how your body feels now compared to a minute ago.
          </p>
          <button onClick={reset} className="nc-btn-secondary">
            Start again
          </button>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Quick reset checklist
// ---------------------------------------------------------------------------
const QUICK_TIPS = [
  { icon: "💧", text: "Drink a glass of water." },
  { icon: "🪟", text: "Look out a window for 30 seconds." },
  { icon: "🧊", text: "Splash cold water on your face or wrists." },
  { icon: "🤲", text: "Place both feet flat on the floor. Notice the contact." },
  { icon: "📱", text: "Put your phone face-down for 5 minutes." },
  { icon: "🚶", text: "Stand up and walk to another room." },
];

function QuickReset() {
  return (
    <section className="nc-card">
      <h2 className="font-medium text-gray-900 mb-1">Quick resets</h2>
      <p className="text-xs text-gray-500 mb-4">
        Tiny actions you can take in under a minute when you need a break.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {QUICK_TIPS.map((t, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
          >
            <span className="text-xl" aria-hidden>{t.icon}</span>
            <span className="text-sm text-gray-700">{t.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
