"""Wellness resource model. Static content for categories like Anxiety, Sleep, etc."""

from database import db


class Resource(db.Model):
    __tablename__ = "resources"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(30), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    tips = db.Column(db.Text, nullable=True)  # newline-separated tips
    image = db.Column(db.String(255), nullable=True)  # image URL or local path

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "category": self.category,
            "description": self.description,
            "tips": [t.strip() for t in (self.tips or "").split("\n") if t.strip()],
            "image": self.image,
        }
