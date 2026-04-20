import polyline from "@mapbox/polyline";

type Coord = {
  latitude: number;
  longitude: number;
};

const ORS_CONFIG = {
  BASE_URL: "https://api.openrouteservice.org/v2/directions",
  API_KEY: process.env.EXPO_PUBLIC_ORS_API_KEY,
};

export const directionService = async (
  start: Coord,
  end: Coord,
  profile: string = "foot-walking",
) => {

  try {
    const response = await fetch(`${ORS_CONFIG.BASE_URL}/${profile}`, {
      method: "POST",
      headers: {
        Authorization: ORS_CONFIG.API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [start.longitude, start.latitude],
          [end.longitude, end.latitude],
        ],
      }),
    });

    const data = await response.json();
    console.log("Direction data:", data);

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch directions");
    }

    // ✅ ORS uses routes, NOT features
    if (!data.routes || data.routes.length === 0) {
      throw new Error("No route found");
    }

    const routeData = data.routes[0];

    // 🔥 decode polyline geometry
    const decoded = polyline.decode(routeData.geometry);

    const route = decoded.map(([lat, lng]: number[]) => ({
      latitude: lat,
      longitude: lng,
    }));

    const summary = routeData.summary;

    return {
      route,
      distance: summary.distance,
      duration: summary.duration,
    };

  } catch (err) {
    console.error("Error fetching directions:", err);
    throw err;
  }
};