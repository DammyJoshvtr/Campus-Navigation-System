import useLocations from "@/hooks/getLocation";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import FAB from "../../components/Fab";
import ScrollItems from "../../components/ScrollItems";
import Searchbar from "../../components/Searchbar";

const Home = () => {
  const router = useRouter();
  const [showSearches, setShowSearches] = useState(false);

  // const [loading, setLoading] = useState(null)

  // const coords = useLocations()useLoa;

  const [searchText, setSearchText] = useState("");

  const { coords, loading } = useLocations();

  const filteredLocations =
    searchText.trim().length > 0
      ? coords.filter((item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase()),
        )
      : [];

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setShowSearches(false);
        Keyboard.dismiss();
      }}
    >
      <View style={styles.container}>
        {/* MAP */}
        <MapView
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
        >
          {!loading &&
            coords?.length > 0 &&
            filteredLocations.map((item) => (
              <Marker
                key={item.id}
                coordinate={{
                  latitude: item.coordinate.latitude,
                  longitude: item.coordinate.longitude,
                }}
              >
                <Callout tooltip>
                  <View
                    style={{
                      backgroundColor: "white",
                      padding: 10,
                      borderRadius: 10,
                      elevation: 5,
                    }}
                  >
                    <Text>{item.name}</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
        </MapView>

        {/* SEARCH SECTION */}
        <View style={styles.searchContainer}>
          <Searchbar
            barText="Search"
            onFocus={() => setShowSearches(true)}
            onChangeText={(text) => setSearchText(text)}
          />

          <ScrollItems />

          {showSearches && (
            <ScrollView contentContainerStyle={styles.dropdown}>
              {filteredLocations.length > 0 ? (
                filteredLocations.map((item) => (
                  <View className="h-9 bg-gray-400 gap-y-3">
                    <Text key={item.id}>{item.name}</Text>
                  </View>
                ))
              ) : (
                <Text>No results found</Text>
              )}
            </ScrollView>
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
  },

  fab: {
    position: "absolute",
    bottom: 80,
    right: 24,
  },
});
