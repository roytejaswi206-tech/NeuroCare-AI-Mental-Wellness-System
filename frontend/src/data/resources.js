// Bundled wellness content. Used by the Resources page when the Flask
// backend is unreachable (e.g. demo on a laptop with the API not running),
// and as the canonical source for category detail pages.
//
// Keep entries short and gentle. Nothing here is medical advice.

export const RESOURCES = [
  {
    id: 1,
    title: "Understanding Anxiety",
    category: "anxiety",
    description:
      "Anxiety is your body's natural response to stress. It can feel like racing thoughts, a fast heartbeat, or restlessness. It is common, treatable, and you are not alone in feeling it.",
    tips: [
      "Practise slow belly breathing for 2 minutes.",
      "Limit caffeine and late-night screen time.",
      "Talk to someone you trust about what is on your mind.",
      "Write down your worries to take them out of your head.",
      "Try the 5-4-3-2-1 grounding exercise when thoughts spiral.",
    ],
    image:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 2,
    title: "Managing Daily Stress",
    category: "stress",
    description:
      "Stress is how your mind and body react to demands. Some stress is useful, but too much can leave you tired and overwhelmed. Small, regular resets help more than one big break.",
    tips: [
      "Take a 5-minute walk between long study sessions.",
      "Break big tasks into small, time-boxed steps.",
      "Drink water - dehydration makes stress feel worse.",
      "Use the Pomodoro method: 25 minutes focus, 5 minutes rest.",
      "Avoid doom-scrolling - set a daily phone limit.",
    ],
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 3,
    title: "Coping with Panic Attacks",
    category: "panic",
    description:
      "A panic attack is a sudden rush of intense fear with physical symptoms like a racing heart, shaking, or chest tightness. It feels frightening but it is not dangerous, and it does pass.",
    tips: [
      "Remind yourself: 'This will pass. I am safe.'",
      "Breathe in for 4 seconds, hold for 7, breathe out for 8.",
      "Press your feet firmly into the floor to feel grounded.",
      "Name 5 things you can see right now.",
      "If panic attacks are frequent, please speak to a counsellor.",
    ],
    image:
      "https://images.unsplash.com/photo-1474418397713-7ede21d49118?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 4,
    title: "Better Sleep Habits",
    category: "sleep",
    description:
      "Sleep affects mood, memory, and stress more than most people realise. A regular wind-down routine often helps more than any sleep app or supplement.",
    tips: [
      "Keep a regular sleep and wake time, even on weekends.",
      "Avoid screens for 30 minutes before bed.",
      "Dim the lights and keep your room cool and dark.",
      "Skip caffeine after 4 pm.",
      "If you cannot sleep after 20 minutes, get up and read a book.",
    ],
    image:
      "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 5,
    title: "Preventing Burnout",
    category: "burnout",
    description:
      "Burnout is the slow build-up of stress that leaves you drained, cynical, and stuck. It happens to students too - especially during exams and project deadlines.",
    tips: [
      "Schedule one full day off study every week.",
      "Talk about how you feel - friends, family, or a counsellor.",
      "Move your body daily, even 10 minutes of walking helps.",
      "Re-connect with a hobby that has nothing to do with college.",
      "Sleep, eat, and hydrate - basics matter most when you feel worst.",
    ],
    image:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=60",
  },
];

export function resourcesByCategory(category) {
  return RESOURCES.filter((r) => r.category === category);
}
