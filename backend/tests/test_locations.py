"""Tests for /api/locations/* endpoints."""


class TestListLocations:
    def test_list_requires_auth(self, client):
        resp = client.get("/api/locations")
        assert resp.status_code == 401

    def test_list_success(self, client, auth_headers, sample_location):
        resp = client.get("/api/locations", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert "locations" in data
        assert "pagination" in data
        assert len(data["locations"]) >= 1

    def test_filter_by_type(self, client, auth_headers, sample_location):
        resp = client.get("/api/locations?type=Library", headers=auth_headers)
        assert resp.status_code == 200
        locations = resp.get_json()["data"]["locations"]
        assert all(loc["type"] == "Library" for loc in locations)

    def test_filter_invalid_type(self, client, auth_headers):
        resp = client.get("/api/locations?type=Underwater", headers=auth_headers)
        assert resp.status_code == 400


class TestGetLocation:
    def test_get_by_id(self, client, auth_headers, sample_location):
        resp = client.get(f"/api/locations/{sample_location.id}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()["data"]["name"] == "Test Library"

    def test_get_nonexistent(self, client, auth_headers):
        resp = client.get("/api/locations/99999", headers=auth_headers)
        assert resp.status_code == 404


class TestCreateLocation:
    def test_create_success(self, client, auth_headers):
        resp = client.post(
            "/api/locations",
            json={
                "name": "New Lecture Hall",
                "latitude": 6.5260,
                "longitude": 3.3800,
                "type": "Lecture Room",
            },
            headers=auth_headers,
        )
        assert resp.status_code == 201
        assert resp.get_json()["data"]["name"] == "New Lecture Hall"

    def test_create_missing_name(self, client, auth_headers):
        resp = client.post(
            "/api/locations",
            json={"latitude": 6.5260, "longitude": 3.3800, "type": "Lecture Room"},
            headers=auth_headers,
        )
        assert resp.status_code == 422

    def test_create_invalid_coords(self, client, auth_headers):
        resp = client.post(
            "/api/locations",
            json={"name": "Bad Place", "latitude": 200, "longitude": 3.38, "type": "Other"},
            headers=auth_headers,
        )
        assert resp.status_code == 422


class TestSearchLocations:
    def test_search_success(self, client, auth_headers, sample_location):
        resp = client.get("/api/locations/search?q=Lib", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()["data"]["count"] >= 1

    def test_search_no_query(self, client, auth_headers):
        resp = client.get("/api/locations/search", headers=auth_headers)
        assert resp.status_code == 400
