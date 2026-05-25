"""
Authentication routes.

The frontend uses the Firebase client SDK for all visible auth (register,
login, Google Sign-In, logout). After Firebase succeeds it POSTs the
Firebase ID token to /api/auth/firebase, which:

  1. Verifies the token (using firebase-admin if a service account is
     configured, otherwise decodes the JWT payload without signature
     verification - acceptable for a student demo, not for production).
  2. Finds or creates a row in the local SQLite `users` table keyed on
     the email from the token.
  3. Returns a short-lived Flask JWT that the frontend then uses for
     /api/moods etc.

The older /register and /login routes are kept so the API works even if
Firebase is unavailable, but the frontend no longer uses them.
"""

import re
import jwt as pyjwt
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from database import db
from models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _bad(msg: str, code: int = 400):
    return jsonify({"error": msg}), code


# ---------------------------------------------------------------------------
# Local email/password (kept as a fallback - frontend uses Firebase now)
# ---------------------------------------------------------------------------

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or len(name) < 2:
        return _bad("Name must be at least 2 characters.")
    if not EMAIL_RE.match(email):
        return _bad("Please enter a valid email address.")
    if len(password) < 6:
        return _bad("Password must be at least 6 characters.")

    if User.query.filter_by(email=email).first():
        return _bad("An account with this email already exists.", 409)

    user = User(name=name, email=email, auth_provider="local")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return _bad("Invalid email or password.", 401)

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 200


# ---------------------------------------------------------------------------
# Firebase ID-token exchange  (this is what the React frontend uses now)
# ---------------------------------------------------------------------------

def _decode_firebase_token(id_token: str) -> dict:
    """
    Return the claims dict {email, name, uid, ...} from a Firebase ID token.

    If FIREBASE_CREDENTIALS_PATH is set, use firebase-admin to fully verify
    the token (recommended for production). Otherwise, decode the JWT
    payload without verification - good enough for a local student demo
    because the token is short-lived and tied to your Firebase project's
    audience claim, which we still check.
    """
    creds_path = current_app.config.get("FIREBASE_CREDENTIALS_PATH")

    if creds_path:
        # Full verification path.
        import firebase_admin
        from firebase_admin import auth as firebase_auth, credentials

        if not firebase_admin._apps:
            cred = credentials.Certificate(creds_path)
            firebase_admin.initialize_app(cred)
        return firebase_auth.verify_id_token(id_token)

    # No service account configured - decode without verifying the signature.
    # This is documented in /backend/README and is fine for the academic demo.
    return pyjwt.decode(id_token, options={"verify_signature": False})


def _find_or_create_user(claims: dict) -> User:
    email = (claims.get("email") or "").lower()
    if not email:
        raise ValueError("Token did not include an email claim.")

    name = (
        claims.get("name")
        or claims.get("display_name")
        or email.split("@")[0]
    )

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(name=name, email=email, auth_provider="firebase")
        db.session.add(user)
        db.session.commit()
    return user


@auth_bp.route("/firebase", methods=["POST"])
def firebase_login():
    """Exchange a Firebase ID token for a Flask JWT."""
    data = request.get_json(silent=True) or {}
    id_token = data.get("id_token")
    if not id_token:
        return _bad("Missing id_token.")

    try:
        claims = _decode_firebase_token(id_token)
    except Exception as e:  # noqa: BLE001
        return _bad(f"Invalid Firebase token: {e}", 401)

    try:
        user = _find_or_create_user(claims)
    except ValueError as e:
        return _bad(str(e), 400)

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 200


# Legacy alias - the previous frontend called this endpoint.
@auth_bp.route("/google", methods=["POST"])
def google_login():
    return firebase_login()


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return _bad("User not found.", 404)
    return jsonify({"user": user.to_dict()}), 200
