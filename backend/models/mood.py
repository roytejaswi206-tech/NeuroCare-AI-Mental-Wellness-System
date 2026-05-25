"""Mood entry model. One row per check-in by a user."""

from datetime import datetime
from database import db


class Mood(db.Model):
    __tablename__ = "moods"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    # User-selected mood label (e.g. "happy", "sad", "anxious")
    mood = db.Column(db.String(30), nullable=False)
    # 1 (low) to 10 (high) self-reported stress
    stress_level = db.Column(db.Integer, nullable=False, default=5)
    # Optional journal note from the user
    note = db.Column(db.Text, nullable=True)

    # AI-derived fields (sentiment of the note)
    sentiment = db.Column(db.String(15), nullable=True)  # positive / neutral / negative
    sentiment_score = db.Column(db.Float, nullable=True)  # -1.0 to 1.0
    suggestion = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "mood": self.mood,
            "stress_level": self.stress_level,
            "note": self.note,
            "sentiment": self.sentiment,
            "sentiment_score": self.sentiment_score,
            "suggestion": self.suggestion,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
