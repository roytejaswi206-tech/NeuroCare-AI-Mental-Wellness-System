"""
Journal routes - lightweight reflective journaling, separate from mood check-ins.

- POST   /api/journal      - create a new journal entry
- GET    /api/journal      - list current user's entries (latest first)
- DELETE /api/journal/<id> - delete one of the current user's entries
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from database import db
from models import JournalEntry

journal_bp = Blueprint("journal", __name__, url_prefix="/api/journal")


def _bad(msg: str, code: int = 400):
    return jsonify({"error": msg}), code


@journal_bp.route("", methods=["POST"])
@jwt_required()
def create_entry():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    title = (data.get("title") or "").strip()
    content = (data.get("content") or "").strip()

    if not content:
        return _bad("Please write something before saving.")
    if len(content) > 5000:
        return _bad("Entry is too long (max 5000 characters).")

    entry = JournalEntry(
        user_id=user_id,
        title=title[:120] if title else None,
        content=content,
    )
    db.session.add(entry)
    db.session.commit()
    return jsonify(entry.to_dict()), 201


@journal_bp.route("", methods=["GET"])
@jwt_required()
def list_entries():
    user_id = int(get_jwt_identity())
    limit = min(int(request.args.get("limit", 50)), 200)

    entries = (
        JournalEntry.query.filter_by(user_id=user_id)
        .order_by(JournalEntry.created_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify([e.to_dict() for e in entries]), 200


@journal_bp.route("/<int:entry_id>", methods=["DELETE"])
@jwt_required()
def delete_entry(entry_id: int):
    user_id = int(get_jwt_identity())
    entry = JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()
    if not entry:
        return _bad("Entry not found.", 404)
    db.session.delete(entry)
    db.session.commit()
    return jsonify({"deleted": entry_id}), 200
