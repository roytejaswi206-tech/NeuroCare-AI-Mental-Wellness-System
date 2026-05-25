"""
Seed the resources table with starter content for the five wellness categories.

Run with:
    python seed.py
"""

from app import create_app
from database import db
from models import Resource

# Free images from Unsplash (already-attributed, hot-link safe URLs).
SEED_DATA = [
    {
        "title": "Understanding Anxiety",
        "category": "anxiety",
        "description": (
            "Anxiety is your body's natural response to stress. It can feel like "
            "racing thoughts, a fast heartbeat, or restlessness. It is common, "
            "treatable, and you are not alone in feeling it."
        ),
        "tips": (
            "Practise slow belly breathing for 2 minutes.\n"
            "Limit caffeine and late-night screen time.\n"
            "Talk to someone you trust about what is on your mind.\n"
            "Write down your worries to take them out of your head.\n"
            "Try the 5-4-3-2-1 grounding exercise when thoughts spiral."
        ),
        "image": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=60",
    },
    {
        "title": "Managing Daily Stress",
        "category": "stress",
        "description": (
            "Stress is how your mind and body react to demands. Some stress is "
            "useful, but too much can leave you tired and overwhelmed. Small, "
            "regular resets help more than one big break."
        ),
        "tips": (
            "Take a 5-minute walk between long study sessions.\n"
            "Break big tasks into small, time-boxed steps.\n"
            "Drink water - dehydration makes stress feel worse.\n"
            "Use the Pomodoro method: 25 minutes focus, 5 minutes rest.\n"
            "Avoid doom-scrolling - set a daily phone limit."
        ),
        "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=60",
    },
    {
        "title": "Coping with Panic Attacks",
        "category": "panic",
        "description": (
            "A panic attack is a sudden rush of intense fear with physical "
            "symptoms like a racing heart, shaking, or chest tightness. It "
            "feels frightening but it is not dangerous, and it does pass."
        ),
        "tips": (
            "Remind yourself: 'This will pass. I am safe.'\n"
            "Breathe in for 4 seconds, hold for 7, breathe out for 8.\n"
            "Press your feet firmly into the floor to feel grounded.\n"
            "Name 5 things you can see right now.\n"
            "If panic attacks are frequent, please speak to a counsellor."
        ),
        "image": "https://images.unsplash.com/photo-1474418397713-7ede21d49118?auto=format&fit=crop&w=800&q=60",
    },
    {
        "title": "Better Sleep Habits",
        "category": "sleep",
        "description": (
            "Sleep affects mood, memory, and stress more than most people "
            "realise. A regular wind-down routine often helps more than any "
            "sleep app or supplement."
        ),
        "tips": (
            "Keep a regular sleep and wake time, even on weekends.\n"
            "Avoid screens for 30 minutes before bed.\n"
            "Dim the lights and keep your room cool and dark.\n"
            "Skip caffeine after 4 pm.\n"
            "If you cannot sleep after 20 minutes, get up and read a book."
        ),
        "image": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=60",
    },
    {
        "title": "Preventing Burnout",
        "category": "burnout",
        "description": (
            "Burnout is the slow build-up of stress that leaves you drained, "
            "cynical, and stuck. It happens to students too - especially "
            "during exams and project deadlines."
        ),
        "tips": (
            "Schedule one full day off study every week.\n"
            "Talk about how you feel - friends, family, or a counsellor.\n"
            "Move your body daily, even 10 minutes of walking helps.\n"
            "Re-connect with a hobby that has nothing to do with college.\n"
            "Sleep, eat, and hydrate - basics matter most when you feel worst."
        ),
        "image": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=60",
    },
]


def run():
    app = create_app()
    with app.app_context():
        db.create_all()

        # Only seed if the table is empty so we don't create duplicates.
        if Resource.query.count() > 0:
            print(f"Resources already seeded ({Resource.query.count()} rows). Skipping.")
            return

        for entry in SEED_DATA:
            db.session.add(Resource(**entry))
        db.session.commit()
        print(f"Seeded {len(SEED_DATA)} wellness resources.")


if __name__ == "__main__":
    run()
