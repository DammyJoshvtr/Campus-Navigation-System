type Coord = {
  latitude: number;
  longitude: number;
};

const ORS_CONFIG = {
  BASE_URL: "https://api.openrouteservice.org/v2/directions",
  API_KEY: process.env.EXPO_PUBLIC_ORS_API_KEY,
};

const handleGetDirections = async (
  start: Coord,
  end: Coord,
  profile: string = "foot-walking"
) => {
  try {
    const response = await fetch(`${ORS_CONFIG.BASE_URL}/${profile}`, {
      method: "POST",
      headers: {
        Authorization: ORS_CONFIG.API_KEY!, // assert it's not undefined
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

    if (!response.ok) {
      throw new Error(`Error fetching directions: ${response.statusText}`);
    }

    // 🔥 Safety check
    if (!data.features || data.features.length === 0) {
      throw new Error("No route found");
    }

    const coords = data.features[0].geometry.coordinates;

    const route = coords.map((point: number[]) => ({
      latitude: point[1],
      longitude: point[0],
    }));

    const summary = data.features[0].properties.summary;

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