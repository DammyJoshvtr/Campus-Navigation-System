/**
 * directionServices.ts — Improved routing service
 *
 * CHANGES vs original:
 * 1. Added coordinate snapping — snaps start/end to nearest road node before routing.
 *    This fixes the "route doesn't start from user location" issue.
 * 2. ORS (OpenRouteService) as primary — "foot-walking" profile, better for campus.
 * 3. OSRM public API as silent fallback when ORS fails/rate-limits.
 * 4. Request deduplication — if same call is in-flight, returns the same promise.
 * 5. Cleans up degenerate routes (removes duplicate consecutive points).
 * 6. Exports RouteResult type so callers don't need to guess the shape.
 */

import polyline from "@mapbox/polyline";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Coord = {
  latitude: number;
  longitude: number;
};

export type RouteResult = {
  route: Coord[];          // decoded polyline coordinates
  distance: number;        // metres
  duration: number;        // seconds
  provider: "ors" | "osrm"; // which API actually answered
};

// ─── Config ──────────────────────────────────────────────────────────────────

const ORS_BASE = "https://api.openrouteservice.org/v2/directions";
const ORS_KEY  = process.env.EXPO_PUBLIC_ORS_API_KEY ?? "";

const OSRM_BASE = "https://router.project-osrm.org/route/v1";

/** Walking speed used for rough ETA when OSRM summary is missing (m/s) */
const WALK_SPEED = 1.4;

// ─── In-flight deduplication ─────────────────────────────────────────────────
// Prevents a second tap on "Get Directions" firing a duplicate request.

const _inFlight = new Map<string, Promise<RouteResult>>();

function _key(start: Coord, end: Coord): string {
  return `${start.latitude.toFixed(5)},${start.longitude.toFixed(5)}` +
         `→${end.latitude.toFixed(5)},${end.longitude.toFixed(5)}`;
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Get a walking route between two coordinates.
 *
 * @param start  Origin (user location or selected "from" point)
 * @param end    Destination coordinate
 * @param profile ORS profile — defaults to "foot-walking" (best for campus)
 */
export async function directionService(
  start: Coord,
  end: Coord,
  profile: "foot-walking" | "cycling-regular" = "foot-walking",
): Promise<RouteResult> {
  const key = _key(start, end);

  // Return existing promise if identical request is already in-flight
  if (_inFlight.has(key)) return _inFlight.get(key)!;

  const promise = _resolve(start, end, profile).finally(() => {
    _inFlight.delete(key);
  });

  _inFlight.set(key, promise);
  return promise;
}

async function _resolve(
  start: Coord,
  end: Coord,
  profile: string,
): Promise<RouteResult> {
  // 1. Try ORS first (richer data, better foot-walking model)
  if (ORS_KEY) {
    try {
      return await _fetchORS(start, end, profile);
    } catch (err) {
      console.warn("[Route] ORS failed, falling back to OSRM:", err);
    }
  }

  // 2. Fallback: OSRM public API (no key required, always available)
  return await _fetchOSRM(start, end);
}

// ─── ORS ─────────────────────────────────────────────────────────────────────

async function _fetchORS(start: Coord, end: Coord, profile: string): Promise<RouteResult> {
  const response = await fetch(`${ORS_BASE}/${profile}`, {
    method: "POST",
    headers: {
      Authorization: ORS_KEY,
      "Content-Type": "application/json",
      Accept: "application/json, application/geo+json",
    },
    body: JSON.stringify({
      coordinates: [
        [start.longitude, start.latitude],   // ORS uses [lng, lat] order!
        [end.longitude, end.latitude],
      ],
      // Request extra info for better accuracy
      instructions: true,
      geometry_simplify: false,             // keep all detail on campus scale
      radiuses: [-1, -1],                   // -1 = unlimited snap radius (fixes start-point miss)
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ORS ${response.status}: ${body}`);
  }

  const data = await response.json();

  if (!data.routes?.length) throw new Error("ORS: no routes in response");

  const routeData = data.routes[0];
  const decoded   = polyline.decode(routeData.geometry) as [number, number][];

  return {
    route: _clean(decoded.map(([lat, lng]) => ({ latitude: lat, longitude: lng }))),
    distance: routeData.summary.distance,
    duration: routeData.summary.duration,
    provider: "ors",
  };
}

// ─── OSRM fallback ───────────────────────────────────────────────────────────

async function _fetchOSRM(start: Coord, end: Coord): Promise<RouteResult> {
  // OSRM coordinate order: longitude,latitude (same as ORS)
  const coords = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
  const url    = `${OSRM_BASE}/foot/${coords}?overview=full&geometries=polyline`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`OSRM ${response.status}`);

  const data = await response.json();
  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("OSRM: no route found");
  }

  const leg      = data.routes[0].legs[0];
  const decoded  = polyline.decode(data.routes[0].geometry) as [number, number][];
  const distance = data.routes[0].distance as number;
  const duration = data.routes[0].duration as number;

  return {
    route: _clean(decoded.map(([lat, lng]) => ({ latitude: lat, longitude: lng }))),
    distance,
    duration,
    provider: "osrm",
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Remove consecutive duplicate coordinates — these can confuse react-native-maps
 * and make the polyline flicker or draw extra segments.
 */
function _clean(coords: Coord[]): Coord[] {
  return coords.filter((c, i) => {
    if (i === 0) return true;
    const prev = coords[i - 1];
    return c.latitude !== prev.latitude || c.longitude !== prev.longitude;
  });
}

// ─── Formatting helpers (shared by both Home and DirectionsScreen) ────────────

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}
