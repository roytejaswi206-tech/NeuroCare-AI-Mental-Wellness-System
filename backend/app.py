"""
NeuroCare backend entry point.

Run locally:
    python app.py

Production:
    gunicorn app:app
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from database import db
from routes import auth_bp, moods_bp, resources_bp, journal_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Extensions
    db.init_app(app)
    JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Surface the active CORS config at boot so it is visible in Railway logs.
    # If you see "Network Error" in the deployed frontend, check this line.
    print(f"[neurocare] CORS_ORIGINS = {app.config['CORS_ORIGINS']!r}")

    # Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(moods_bp)
    app.register_blueprint(resources_bp)
    app.register_blueprint(journal_bp)

    # Health check + root
    @app.route("/")
    def root():
        return jsonify({
            "name": "NeuroCare API",
            "status": "ok",
            "disclaimer": (
                "This project is developed for educational purposes only and "
                "does not replace professional medical advice."
            ),
        })

    @app.route("/api/health")
    def health():
        # Small diagnostic so the frontend banner can tell the user whether
        # the backend is warming up (cold start) or actually broken.
        from models import Resource
        try:
            resource_count = Resource.query.count()
        except Exception:  # noqa: BLE001
            resource_count = -1
        return jsonify({
            "status": "ok",
            "resources_seeded": resource_count > 0,
            "resource_count": resource_count,
        })

    # Create tables on first run (simpler than migrations for a student project).
    # Also auto-seed the resources table when empty - useful on Railway where
    # SQLite is ephemeral and the seed.py script does not run on every boot.
    with app.app_context():
        db.create_all()
        _ensure_resources_seeded()

    return app


def _ensure_resources_seeded():
    """If the resources table is empty, populate it from seed.py's SEED_DATA."""
    from models import Resource
    if Resource.query.count() > 0:
        return
    try:
        from seed import SEED_DATA
        for entry in SEED_DATA:
            db.session.add(Resource(**entry))
        db.session.commit()
    except Exception as exc:  # noqa: BLE001
        # Never let a seed failure prevent the app from starting.
        db.session.rollback()
        print(f"[neurocare] Auto-seed skipped: {exc}")


app = create_app()


if __name__ == "__main__":
    # debug=True restarts on file changes - handy during development.
    # Honour $PORT for parity with the Railway runtime.
    import os
    port = int(os.getenv("PORT", "5000"))
    app.run(host="127.0.0.1", port=port, debug=True)
