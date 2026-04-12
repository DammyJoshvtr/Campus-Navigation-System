"""Tests for /api/directions and the directions service."""
import pytest
from app.services.directions_service import (
    haversine_distance,
    get_directions,
    Coordinate,
)


class TestHaversine:
    def test_same_point_is_zero(self):
        a = Coordinate(6.5244, 3.3792)
        assert haversine_distance(a, a) == pytest.approx(0.0)

    def test_known_distance(self):
        # Rough distance between two Lagos points ~450 m
        a = Coordinate(6.5244, 3.3792)
        b = Coordinate(6.5280, 3.3810)
        dist = haversine_distance(a, b)
        assert 400 < dist < 600

    def test_symmetry(self):
        a = Coordinate(6.5244, 3.3792)
        b = Coordinate(6.5280, 3.3810)
        assert haversine_distance(a, b) == pytest.approx(haversine_distance(b, a))


class TestGetDirections:
    def test_basic_result(self):
        result = get_directions(6.5244, 3.3792, 6.5280, 3.3810)
        assert result.distance_m > 0
        assert result.duration_s > 0
        assert len(result.route) >= 2

    def test_route_starts_and_ends_correctly(self):
        result = get_directions(6.5244, 3.3792, 6.5280, 3.3810)
        assert result.route[0].lat == pytest.approx(6.5244)
        assert result.route[0].lng == pytest.approx(3.3792)
        assert result.route[-1].lat == pytest.approx(6.5280)
        assert result.route[-1].lng == pytest.approx(3.3810)

    def test_same_origin_destination_raises(self):
        with pytest.raises(ValueError, match="different"):
            get_directions(6.5244, 3.3792, 6.5244, 3.3792)

    def test_invalid_lat_raises(self):
        with pytest.raises(ValueError):
            get_directions(200, 3.3792, 6.5280, 3.3810)

    def test_display_formatting_meters(self):
        result = get_directions(6.5244, 3.3792, 6.5246, 3.3793)  # very close
        assert "m" in result.distance_display

    def test_display_formatting_km(self):
        result = get_directions(6.5244, 3.3792, 6.6244, 3.4792)  # far apart
        assert "km" in result.distance_display

    def test_to_dict_structure(self):
        result = get_directions(6.5244, 3.3792, 6.5280, 3.3810)
        d = result.to_dict()
        assert all(k in d for k in ("distance", "distance_meters", "duration", "duration_seconds", "route"))
        assert isinstance(d["route"], list)
        assert all("lat" in p and "lng" in p for p in d["route"])


class TestDirectionsAPI:
    def test_directions_success(self, client, auth_headers):
        resp = client.post(
            "/api/directions",
            json={
                "origin": {"lat": 6.5244, "lng": 3.3792},
                "destination": {"lat": 6.5280, "lng": 3.3810},
            },
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert "distance" in data
        assert "duration" in data
        assert "route" in data
        assert len(data["route"]) > 0

    def test_directions_missing_origin(self, client, auth_headers):
        resp = client.post(
            "/api/directions",
            json={"destination": {"lat": 6.5280, "lng": 3.3810}},
            headers=auth_headers,
        )
        assert resp.status_code == 422

    def test_directions_invalid_lat(self, client, auth_headers):
        resp = client.post(
            "/api/directions",
            json={
                "origin": {"lat": 999, "lng": 3.3792},
                "destination": {"lat": 6.5280, "lng": 3.3810},
            },
            headers=auth_headers,
        )
        assert resp.status_code == 422

    def test_directions_requires_auth(self, client):
        resp = client.post(
            "/api/directions",
            json={
                "origin": {"lat": 6.5244, "lng": 3.3792},
                "destination": {"lat": 6.5280, "lng": 3.3810},
            },
        )
        assert resp.status_code == 401
