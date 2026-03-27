import * as Location from "expo-location";
import { useEffect, useState } from "react";

function useUserLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let loc: any = await Location.getCurrentPositionAsync({});
      console.log(loc);
      setLocation(loc);
    })();
  }, []);

  return location;
}

export default useUserLocation;
