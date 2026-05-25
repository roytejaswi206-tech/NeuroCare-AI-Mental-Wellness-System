"""User model. Stores account credentials and basic profile info."""

from datetime import datetime
import bcrypt
from database import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    # Nullable so Google Sign-In users can exist without a local password.
    password_hash = db.Column(db.String(255), nullable=True)
    auth_provider = db.Column(db.String(20), nullable=False, default="local")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    moods = db.relationship("Mood", backref="user", lazy=True, cascade="all, delete-orphan")

    def set_password(self, password: str) -> None:
        """Hash and store the given plaintext password."""
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        self.password_hash = hashed.decode("utf-8")

    def check_password(self, password: str) -> bool:
        """Verify a plaintext password against the stored hash."""
        if not self.password_hash:
            return False
        return bcrypt.checkpw(
            password.encode("utf-8"), self.password_hash.encode("utf-8")
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "auth_provider": self.auth_provider,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
