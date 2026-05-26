"""Route blueprints."""

from .auth import auth_bp
from .moods import moods_bp
from .resources import resources_bp
from .journal import journal_bp

__all__ = ["auth_bp", "moods_bp", "resources_bp", "journal_bp"]
