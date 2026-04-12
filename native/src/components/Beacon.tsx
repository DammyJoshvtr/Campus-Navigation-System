import { AntDesign } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import * as Device from "expo-device";
import * as Location from "expo-location";

export default function Beacon() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      if (Platform.OS === "android" && !Device.isDevice) {
        setErrorMsg("Try this on a real device");
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permission denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    }

    getCurrentLocation();
  }, []);

  return (
    <View>
      {location && (
        <AntDesign name="aim" size={30} color="blue" />
      )}
      <Text>
        {location
          ? `Lat: ${location.coords.latitude}, Lng: ${location.coords.longitude}`
          : errorMsg || "Getting location..."}
      </Text>
    </View>
  );
}