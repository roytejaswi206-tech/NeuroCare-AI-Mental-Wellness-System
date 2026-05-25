// Shared mood metadata used by tracker, history, and dashboard.

export const MOOD_OPTIONS = [
  { value: "happy",    label: "Happy",    emoji: "😊", color: "bg-emerald-100 text-emerald-700" },
  { value: "calm",     label: "Calm",     emoji: "😌", color: "bg-sky-100 text-sky-700" },
  { value: "neutral",  label: "Neutral",  emoji: "🙂", color: "bg-slate-100 text-slate-700" },
  { value: "stressed", label: "Stressed", emoji: "😣", color: "bg-orange-100 text-orange-700" },
  { value: "sad",      label: "Sad",      emoji: "😢", color: "bg-blue-100 text-blue-700" },
  { value: "anxious",  label: "Anxious",  emoji: "😟", color: "bg-amber-100 text-amber-700" },
];

export function getMoodMeta(value) {
  return MOOD_OPTIONS.find((m) => m.value === value) || {
    value,
    label: value,
    emoji: "·",
    color: "bg-gray-100 text-gray-700",
  };
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
