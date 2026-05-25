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
from routes import auth_bp, moods_bp, resources_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Extensions
    db.init_app(app)
    JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(moods_bp)
    app.register_blueprint(resources_bp)

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
        return jsonify({"status": "ok"})

    # Create tables on first run (simpler than migrations for a student project).
    with app.app_context():
        db.create_all()

    return app


app = create_app()


if __name__ == "__main__":
    # debug=True restarts on file changes - handy during development.
    app.run(host="127.0.0.1", port=5000, debug=True)
