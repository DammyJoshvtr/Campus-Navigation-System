import FAB from "@/components/Fab";
import ScrollItems from "@/components/ScrollItems";
import Searchbar from "@/components/Searchbar";
import React from "react";
import { StyleSheet, View } from "react-native";
import MapView from "react-native-maps";

const Home = () => {
  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 6.5244,
          longitude: 3.3792,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      />

      {/* Search Bar Overlay */}
      <View style={styles.searchContainer}>
        <Searchbar />
        <ScrollItems />
      </View>

      <View className="absolute bottom-20 right-6">
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
