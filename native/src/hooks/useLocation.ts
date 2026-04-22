import * as Location from "expo-location";
import { useEffect, useState } from "react";

export const useUserLocation = () => {
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    let subscription: any;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (loc) => {
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
    };

    startTracking();

    return () => subscription?.remove();
  }, []);

  return location;
};