"""
Wellness resource routes (public - no auth required so the resources page
can be browsed even when logged out).

- GET /api/resources                - list all resources
- GET /api/resources/<category>     - filter by category
"""

from flask import Blueprint, jsonify
from models import Resource

resources_bp = Blueprint("resources", __name__, url_prefix="/api/resources")


@resources_bp.route("", methods=["GET"])
def list_resources():
    items = Resource.query.order_by(Resource.category, Resource.id).all()
    return jsonify([r.to_dict() for r in items]), 200


@resources_bp.route("/<string:category>", methods=["GET"])
def by_category(category: str):
    items = (
        Resource.query.filter_by(category=category.lower())
        .order_by(Resource.id)
        .all()
    )
    return jsonify([r.to_dict() for r in items]), 200
