// Daily wellness tip - picks one tip per day, deterministic by date so the
// same tip is shown to every user on the same day (easy to demo in viva, and
// no backend round-trip needed). Tips are short, gentle, student-friendly.
// Nothing here is medical advice.

const TIPS = [
  { icon: "💧", text: "Drink a glass of water now. Mild dehydration quietly worsens stress and focus." },
  { icon: "🌬️", text: "Try one minute of slow breathing: in for 4 seconds, out for 6. Repeat." },
  { icon: "🚶", text: "Stand up and walk for two minutes - even within your room. Small movement resets the mind." },
  { icon: "📵", text: "Take a 10-minute screen break. Look at something far away to rest your eyes." },
  { icon: "😴", text: "Aim to sleep and wake at the same time today. Routine matters more than total hours." },
  { icon: "📝", text: "Write down one thing you are grateful for today, however small." },
  { icon: "🤝", text: "Message a friend or family member just to say hi. Connection is a wellness habit." },
  { icon: "🍎", text: "Eat something nourishing in the next hour. Don't skip meals when you are busy." },
  { icon: "🧘", text: "Drop your shoulders, unclench your jaw, and take three slow breaths." },
  { icon: "🎶", text: "Play one song that always makes you feel better. Three minutes of mood reset." },
  { icon: "📖", text: "Read one page of something not on your phone. Books slow the mind down." },
  { icon: "🌳", text: "Step outside for five minutes if you can. Natural light supports your sleep tonight." },
  { icon: "🛏️", text: "Avoid screens for 30 minutes before bed. Your sleep will thank you." },
  { icon: "✍️", text: "Write down one worry. Naming it usually shrinks it." },
  { icon: "🎯", text: "Pick the smallest next task and do only that. Momentum follows action." },
  { icon: "☕", text: "Skip caffeine after 4 pm today. Notice if your sleep is different." },
  { icon: "🧊", text: "Splash cold water on your face. A quick reset for an anxious moment." },
  { icon: "💬", text: "If something is bothering you, say it out loud to someone you trust." },
  { icon: "🪟", text: "Look out a window for 30 seconds. Distance vision relaxes the nervous system." },
  { icon: "🧴", text: "Stretch your neck and shoulders for one minute. Tension lives there." },
  { icon: "📅", text: "Plan one thing to look forward to this week, even a small one." },
  { icon: "🥗", text: "Add one fruit or vegetable to your next meal. No big diet changes needed." },
  { icon: "🔕", text: "Mute one notification you do not need. Less noise, more calm." },
  { icon: "🤲", text: "Place a hand on your chest and take three deep breaths. You are doing better than you think." },
  { icon: "🕯️", text: "Dim the lights in your room one hour before bed. Help your body wind down." },
  { icon: "🎒", text: "Pack your bag tonight so tomorrow morning feels less rushed." },
  { icon: "💌", text: "Reply to one message you've been putting off. Closure is a relief." },
  { icon: "🌅", text: "Wake up and get sunlight on your face for two minutes. It anchors your sleep cycle." },
  { icon: "🧠", text: "If your mind is racing, try the 5-4-3-2-1 grounding exercise. Visit the Exercises page." },
  { icon: "🎈", text: "Be kind to yourself today. You don't have to be productive every single hour." },
];

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getDailyTip(date = new Date()) {
  // Same tip for everyone on the same day - simple and demo-friendly.
  return TIPS[dayOfYear(date) % TIPS.length];
}

export const ALL_TIPS = TIPS;
