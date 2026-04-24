/**
 * hooks/useLocation.ts
 *
 * CHANGES vs original:
 * - Accuracy bumped to BestForNavigation (most precise GPS fix)
 * - Returns heading + speed so the home screen can rotate the user dot if desired
 * - distanceInterval lowered to 2m for better responsiveness on campus scale
 */

import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";

export type UserCoords = {
  latitude:  number;
  longitude: number;
  heading?:  number;
  speed?:    number;
  accuracy?: number;
};

export const useUserLocation = (): UserCoords | null => {
  const [location, setLocation]   = useState<UserCoords | null>(null);
  const subscriptionRef           = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let active = true;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted" || !active) return;

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy:         Location.Accuracy.BestForNavigation, // ← improved
          timeInterval:     2000,
          distanceInterval: 2,                                   // ← was 5m, now 2m
        },
        (loc) => {
          if (!active) return;
          setLocation({
            latitude:  loc.coords.latitude,
            longitude: loc.coords.longitude,
            heading:   loc.coords.heading  ?? undefined,
            speed:     loc.coords.speed    ?? undefined,
            accuracy:  loc.coords.accuracy ?? undefined,
          });
        },
      );
    };

    startTracking();

    return () => {
      active = false;
      subscriptionRef.current?.remove();
    };
  }, []);

  return location;
};
