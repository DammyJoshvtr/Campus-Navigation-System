"""
Directions service.

Uses the Haversine formula for accurate great-circle distance and generates
a realistic interpolated polyline between two campus coordinates.
"""
import math
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Average walking speed on campus (m/s)
WALKING_SPEED_MS = 1.4


# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Coordinate:
    lat: float
    lng: float

    def to_dict(self) -> dict:
        return {"lat": self.lat, "lng": self.lng}

    def validate(self) -> None:
        if not (-90 <= self.lat <= 90):
            raise ValueError(f"Latitude {self.lat} is out of range [-90, 90].")
        if not (-180 <= self.lng <= 180):
            raise ValueError(f"Longitude {self.lng} is out of range [-180, 180].")


@dataclass
class DirectionsResult:
    distance_m: float
    duration_s: float
    route: list[Coordinate]

    @property
    def distance_display(self) -> str:
        if self.distance_m < 1000:
            return f"{self.distance_m:.0f} m"
        return f"{self.distance_m / 1000:.2f} km"

    @property
    def duration_display(self) -> str:
        minutes = self.duration_s / 60
        if minutes < 1:
            return "< 1 min"
        return f"{math.ceil(minutes)} min{'s' if minutes >= 2 else ''}"

    def to_dict(self) -> dict:
        return {
            "distance": self.distance_display,
            "distance_meters": round(self.distance_m, 2),
            "duration": self.duration_display,
            "duration_seconds": round(self.duration_s),
            "route": [c.to_dict() for c in self.route],
        }


# ---------------------------------------------------------------------------
# Haversine
# ---------------------------------------------------------------------------

_EARTH_RADIUS_M = 6_371_000  # metres


def haversine_distance(a: Coordinate, b: Coordinate) -> float:
    """Return the great-circle distance in metres between *a* and *b*."""
    lat1, lng1 = math.radians(a.lat), math.radians(a.lng)
    lat2, lng2 = math.radians(b.lat), math.radians(b.lng)

    dlat = lat2 - lat1
    dlng = lng2 - lng1

    h = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    )
    return 2 * _EARTH_RADIUS_M * math.asin(math.sqrt(h))


# ---------------------------------------------------------------------------
# Polyline generation
# ---------------------------------------------------------------------------

def _bearing(a: Coordinate, b: Coordinate) -> float:
    """Initial bearing from *a* to *b* in degrees (0–360)."""
    lat1 = math.radians(a.lat)
    lat2 = math.radians(b.lat)
    dlng = math.radians(b.lng - a.lng)
    x = math.sin(dlng) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlng)
    return (math.degrees(math.atan2(x, y)) + 360) % 360


def _destination(origin: Coordinate, bearing_deg: float, distance_m: float) -> Coordinate:
    """
    Return the coordinate reached by travelling *distance_m* metres from
    *origin* at *bearing_deg* degrees (great-circle).
    """
    R = _EARTH_RADIUS_M
    d = distance_m / R
    b = math.radians(bearing_deg)

    lat1 = math.radians(origin.lat)
    lng1 = math.radians(origin.lng)

    lat2 = math.asin(
        math.sin(lat1) * math.cos(d) + math.cos(lat1) * math.sin(d) * math.cos(b)
    )
    lng2 = lng1 + math.atan2(
        math.sin(b) * math.sin(d) * math.cos(lat1),
        math.cos(d) - math.sin(lat1) * math.sin(lat2),
    )

    return Coordinate(lat=math.degrees(lat2), lng=math.degrees(lng2))


def _interpolate_route(
    origin: Coordinate,
    destination: Coordinate,
    distance_m: float,
    num_points: int = 20,
) -> list[Coordinate]:
    """
    Generate a realistic campus path by:
    1. Interpolating a straight-line great-circle route.
    2. Adding an optional 90-degree waypoint to simulate walking around
       buildings (L-shaped path) when the distance warrants it.
    """
    if distance_m < 50:
        # Close enough – straight line with a handful of points
        points = []
        for i in range(num_points + 1):
            t = i / num_points
            lat = origin.lat + t * (destination.lat - origin.lat)
            lng = origin.lng + t * (destination.lng - origin.lng)
            points.append(Coordinate(lat=lat, lng=lng))
        return points

    # For longer paths simulate an L-shaped route (horizontal then vertical)
    # This mimics how pedestrians navigate campus grids.
    waypoint = Coordinate(lat=origin.lat, lng=destination.lng)

    segment1_dist = haversine_distance(origin, waypoint)
    segment2_dist = haversine_distance(waypoint, destination)

    # Proportion of points per segment
    total = segment1_dist + segment2_dist
    n1 = max(2, round(num_points * segment1_dist / total))
    n2 = max(2, num_points - n1)

    def _segment_points(a: Coordinate, b: Coordinate, n: int) -> list[Coordinate]:
        return [
            Coordinate(
                lat=a.lat + (i / n) * (b.lat - a.lat),
                lng=a.lng + (i / n) * (b.lng - a.lng),
            )
            for i in range(n)
        ]

    route = _segment_points(origin, waypoint, n1)
    route += _segment_points(waypoint, destination, n2)
    route.append(destination)
    return route


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_directions(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    num_points: int = 20,
) -> DirectionsResult:
    """
    Compute directions between two campus coordinates.

    Args:
        origin_lat / origin_lng: Starting point.
        dest_lat / dest_lng:     Ending point.
        num_points:              Number of intermediate route coordinates.

    Returns:
        DirectionsResult with distance, duration, and polyline.
    """
    origin = Coordinate(lat=origin_lat, lng=origin_lng)
    destination = Coordinate(lat=dest_lat, lng=dest_lng)

    origin.validate()
    destination.validate()

    if origin == destination:
        raise ValueError("Origin and destination must be different locations.")

    distance_m = haversine_distance(origin, destination)
    duration_s = distance_m / WALKING_SPEED_MS
    route = _interpolate_route(origin, destination, distance_m, num_points)

    logger.debug(
        "Directions computed: %.1f m / %.0f s, %d route points.",
        distance_m,
        duration_s,
        len(route),
    )

    return DirectionsResult(
        distance_m=distance_m,
        duration_s=duration_s,
        route=route,
    )
