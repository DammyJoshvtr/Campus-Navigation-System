import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import FAB from "../../components/Fab";
import ScrollItems from "../../components/ScrollItems";
import Searchbar from "../../components/Searchbar";

const Home = () => {
  const router = useRouter();
  const [showSearches, setShowSearches] = useState(false);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setShowSearches(false);
        Keyboard.dismiss();
      }}
    >
      <View style={styles.container}>
        {/* MAP */}
        {/* <MapView
          style={styles.map}
          showsUserLocation={true}
          showsMyLocationButton={true}
          customMapStyle={[
            {
              featureType: "poi",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "transit",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "road",
              stylers: [{ visibility: "simplified" }],
            },
            {
              featureType: "administrative",
              stylers: [{ visibility: "off" }],
            },
          ]}
          initialRegion={{
            latitude: 7.6786,
            longitude: 4.4532,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          }}
        /> */}

        {/* SEARCH SECTION */}
        <View style={styles.searchContainer}>
          <Searchbar barText="Search" onFocus={() => setShowSearches(true)} />

          <ScrollItems />

          {showSearches && (
            <View style={styles.dropdown}>
              <Text className="font-home-medium text-gray-700">Where To?</Text>
            </View>
          )}
        </View>

        {/* FLOATING BUTTON */}
        <View style={styles.fab}>
          <FAB onPress={() => router.push("/Directions")} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    ...StyleSheet.absoluteFill,
  },

  searchContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    gap: 10,
    zIndex: 10,
  },

  dropdown: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 10,
    minHeight: 150,
    maxHeight: 200,
    elevation: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  fab: {
    position: "absolute",
    bottom: 80,
    right: 24,
  },
});
