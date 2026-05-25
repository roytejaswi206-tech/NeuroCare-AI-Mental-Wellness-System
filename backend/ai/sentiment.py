"""
Simple AI sentiment analysis for journal notes.

Uses VADER (rule-based, social-media tuned) as the primary signal and TextBlob
(naive Bayes on movie reviews) as a secondary check. We average the two
polarity scores to get a final value between -1 (very negative) and +1 (very
positive).

NOTE: This is NOT a medical tool. It only categorises the *tone* of the note
the user wrote and is used to surface gentle wellness suggestions.
"""

from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

_vader = SentimentIntensityAnalyzer()


def analyze_sentiment(text: str) -> dict:
    """
    Return a dict with the sentiment label and combined score.

    {"label": "positive" | "neutral" | "negative", "score": float}

    We treat VADER as the primary signal (it is tuned for short, informal
    text), and TextBlob as a confirmation. If the two disagree on direction,
    we report neutral - it is more honest than picking a side. This is easy
    to explain in viva: "Two simple models, both have to agree."
    """
    if not text or not text.strip():
        return {"label": "neutral", "score": 0.0}

    # VADER compound score: -1 .. 1
    vader_score = _vader.polarity_scores(text)["compound"]
    # TextBlob polarity: -1 .. 1
    try:
        tb_score = TextBlob(text).sentiment.polarity
    except Exception:
        tb_score = 0.0

    combined = (vader_score + tb_score) / 2.0

    # Both models must agree on direction (sign) before we commit to a label.
    if vader_score >= 0.15 and tb_score >= 0.0:
        label = "positive"
    elif vader_score <= -0.15 and tb_score <= 0.0:
        label = "negative"
    else:
        label = "neutral"

    return {"label": label, "score": round(combined, 3)}


# Suggestion library, indexed by (mood-bucket, stress-bucket).
# Kept short and gentle - no medical claims.
SUGGESTIONS = {
    "low_stress_positive": [
        "You seem to be in a good place. Keep doing what's working - maybe note it down for tougher days.",
        "Glad to hear things feel light today. A short walk or a chat with a friend can extend the mood.",
    ],
    "low_stress_neutral": [
        "A quiet day is a chance to rest. Try a 5-minute mindful breathing break to stay grounded.",
        "Things feel steady. Drink some water and take a screen break if you can.",
    ],
    "low_stress_negative": [
        "Even low-stress days can feel heavy. Try writing down three small things you appreciate today.",
        "Be kind to yourself today. A short walk outside or some calming music may help.",
    ],
    "mid_stress_positive": [
        "You're handling things well. Remember to pause between tasks - even 2 minutes helps.",
        "Good energy today. Plan one short break in the next hour to protect that focus.",
    ],
    "mid_stress_neutral": [
        "A balanced day. Try the 4-7-8 breathing technique once if your mind feels busy.",
        "Stretch for a minute, look out a window, drink some water. Small resets add up.",
    ],
    "mid_stress_negative": [
        "It sounds like today is a bit heavy. Try a 3-minute breathing exercise and step outside if you can.",
        "Try grounding: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you smell, 1 you taste.",
    ],
    "high_stress_positive": [
        "High energy can tip into burnout. Schedule one real break today - phone away, eyes off the screen.",
        "Even when things feel exciting, your body needs rest. A short nap or stretch can help.",
    ],
    "high_stress_neutral": [
        "Stress is building quietly. Try slow box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.",
        "Take 10 minutes away from screens. Walk, stretch, or just close your eyes.",
    ],
    "high_stress_negative": [
        "Today sounds tough. Please be kind to yourself - rest, hydrate, and reach out to someone you trust.",
        "If feelings get overwhelming, talk to a friend, family member, or a helpline. You don't have to handle it alone.",
    ],
}


def _stress_bucket(level: int) -> str:
    if level <= 3:
        return "low_stress"
    if level <= 6:
        return "mid_stress"
    return "high_stress"


def generate_suggestion(mood: str, stress_level: int, sentiment_label: str) -> str:
    """
    Pick a short suggestion based on the user's mood, stress level (1-10),
    and the sentiment of their note.
    """
    bucket = f"{_stress_bucket(stress_level)}_{sentiment_label}"
    options = SUGGESTIONS.get(bucket, SUGGESTIONS["mid_stress_neutral"])
    # Deterministic pick so the suggestion is stable for the same input -
    # easier to demo during viva.
    idx = (len(mood) + stress_level) % len(options)
    return options[idx]
