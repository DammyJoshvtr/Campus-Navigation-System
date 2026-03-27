import useUserLocation from "@/hooks/useLocation";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import FAB from "../../components/Fab";
import ScrollItems from "../../components/ScrollItems";
import Searchbar from "../../components/Searchbar";

const Home = () => {
  const location = useUserLocation();

  useEffect(() => {
    if (location) {
      console.log(location);
    }
  }, [location]);

  if (!location) {
    return null;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 7.6786,
          longitude: 4.4532,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
        >
          {/* <AntDesign name="enviromento" size={30} color="red" /> */}
        </Marker>
      </MapView>

      <View style={styles.searchContainer}>
        <Searchbar />
        <ScrollItems />
      </View>

      <View style={{ position: "absolute", bottom: 80, right: 24 }}>
        <FAB onPress={() => console.log("Pressed")} />
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    ...StyleSheet.absoluteFill, // fills entire screen
  },

  searchContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    gap: 10,
    justifyContent: "center",

    // nice shadow
    elevation: 5,
  },
});
