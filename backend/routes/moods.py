"""
Mood tracking routes.

- POST /api/moods         - log a new mood entry (runs sentiment analysis)
- GET  /api/moods         - list the current user's mood entries (latest first)
- GET  /api/moods/stats   - simple aggregates for the dashboard charts
"""

import random
from datetime import datetime, timedelta
from collections import Counter

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from database import db
from models import Mood
from ai import analyze_sentiment, generate_suggestion

moods_bp = Blueprint("moods", __name__, url_prefix="/api/moods")

ALLOWED_MOODS = {
    "happy", "calm", "neutral", "stressed", "sad", "anxious",
}


def _bad(msg: str, code: int = 400):
    return jsonify({"error": msg}), code


@moods_bp.route("", methods=["POST"])
@jwt_required()
def create_mood():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    mood = (data.get("mood") or "").strip().lower()
    note = (data.get("note") or "").strip()
    try:
        stress_level = int(data.get("stress_level", 5))
    except (TypeError, ValueError):
        return _bad("stress_level must be a number between 1 and 10.")

    if mood not in ALLOWED_MOODS:
        return _bad(f"mood must be one of: {', '.join(sorted(ALLOWED_MOODS))}")
    if not 1 <= stress_level <= 10:
        return _bad("stress_level must be between 1 and 10.")

    sentiment = analyze_sentiment(note)
    suggestion = generate_suggestion(mood, stress_level, sentiment["label"])

    entry = Mood(
        user_id=user_id,
        mood=mood,
        stress_level=stress_level,
        note=note or None,
        sentiment=sentiment["label"],
        sentiment_score=sentiment["score"],
        suggestion=suggestion,
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify(entry.to_dict()), 201


@moods_bp.route("", methods=["GET"])
@jwt_required()
def list_moods():
    user_id = int(get_jwt_identity())
    limit = min(int(request.args.get("limit", 50)), 200)

    entries = (
        Mood.query.filter_by(user_id=user_id)
        .order_by(Mood.created_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify([e.to_dict() for e in entries]), 200


@moods_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    """Last-7-days stress trend and mood distribution for charts."""
    user_id = int(get_jwt_identity())
    since = datetime.utcnow() - timedelta(days=7)

    entries = (
        Mood.query.filter(Mood.user_id == user_id, Mood.created_at >= since)
        .order_by(Mood.created_at.asc())
        .all()
    )

    # Stress trend (date -> avg stress)
    trend_by_day: dict = {}
    for e in entries:
        day = e.created_at.strftime("%Y-%m-%d")
        trend_by_day.setdefault(day, []).append(e.stress_level)
    trend = [
        {"date": day, "avg_stress": round(sum(values) / len(values), 1)}
        for day, values in sorted(trend_by_day.items())
    ]

    # Mood distribution (count of each label)
    distribution = [
        {"mood": mood, "count": count}
        for mood, count in Counter(e.mood for e in entries).items()
    ]

    return jsonify({
        "trend": trend,
        "distribution": distribution,
        "total_entries": len(entries),
    }), 200


# A small library of believable demo entries used by /seed-demo. Each tuple
# is (mood, stress_level, note). The endpoint spreads ~10 of these across
# the last 7 days for the current user so charts have data during the viva.
_DEMO_ENTRIES = [
    ("happy",    3, "Finished my assignment early. Felt accomplished and relaxed."),
    ("calm",     2, "Quiet morning. Took a short walk and had a good breakfast."),
    ("stressed", 8, "Two deadlines this week. My head feels heavy."),
    ("anxious",  7, "Cannot stop thinking about the lab viva tomorrow."),
    ("neutral",  5, "Average day. Studied, ate, watched a show. Nothing big."),
    ("sad",      6, "Missed home today. Talked to mom and felt a bit better."),
    ("calm",     3, "Good study session. Took breaks and stayed hydrated."),
    ("happy",    4, "Hangout with friends in the evening. Laughed a lot."),
    ("stressed", 7, "Submitted project late. Lecturer was kind about it though."),
    ("anxious",  6, "Worried about marks. Trying to remind myself it is fine."),
    ("neutral",  4, "Nothing notable. Slept well at least."),
    ("calm",     2, "Read a chapter for fun, not for class. Small win."),
]


@moods_bp.route("/seed-demo", methods=["POST"])
@jwt_required()
def seed_demo():
    """
    Insert ~10 mood entries spread across the last 7 days for the current
    user, but only if they have no existing entries. Lets the dashboard
    and history charts come alive for a viva demo.
    """
    user_id = int(get_jwt_identity())

    if Mood.query.filter_by(user_id=user_id).count() > 0:
        return jsonify({"created": 0, "message": "User already has entries."}), 200

    now = datetime.utcnow()
    rng = random.Random(user_id)  # deterministic per user, easier to demo
    sample = rng.sample(_DEMO_ENTRIES, k=min(10, len(_DEMO_ENTRIES)))

    created = []
    for i, (mood, stress, note) in enumerate(sample):
        # Spread entries across the last 7 days, mostly one per day with
        # the odd extra so distribution looks natural.
        days_ago = i % 7
        ts = now - timedelta(days=days_ago, hours=rng.randint(0, 18))
        sent = analyze_sentiment(note)
        entry = Mood(
            user_id=user_id,
            mood=mood,
            stress_level=stress,
            note=note,
            sentiment=sent["label"],
            sentiment_score=sent["score"],
            suggestion=generate_suggestion(mood, stress, sent["label"]),
            created_at=ts,
        )
        db.session.add(entry)
        created.append(entry)

    db.session.commit()
    return jsonify({"created": len(created)}), 201
