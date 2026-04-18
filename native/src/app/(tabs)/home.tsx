import useLocations from "@/hooks/getLocation";
import { getColor, getIcon } from "@/services/iconUtitils";
import { useRouter } from "expo-router";
import React, { useState, useRef } from "react";
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Button,
} from "react-native";
import MapView, { Marker, Region, Polyline } from "react-native-maps";
import FAB from "../../components/Fab";
import ScrollItems from "../../components/ScrollItems";
import Searchbar from "../../components/Searchbar";
import LocationBottomSheet from "@/components/bottomSheets/LocationBottomSheet";
import BottomSheet from "@gorhom/bottom-sheet";
import LocationError from "@/components/error/locationError";
import { useUserLocation } from "@/hooks/useLocation";

const typeStyles: any = {
  "Lecture Rooms": { bg: "#E3F2FD", text: "#1E88E5" },
  Faculty: { bg: "#E8F5E9", text: "#43A047" },
  Library: { bg: "#F3E5F5", text: "#8E24AA" },
  Laboratory: { bg: "#FFF3E0", text: "#FB8C00" },
  Administrative: { bg: "#ECEFF1", text: "#546E7A" },
  "Event Centre": { bg: "#FCE4EC", text: "#D81B60" },
  "Food & Dining": { bg: "#FFF8E1", text: "#F57F17" },
  Health: { bg: "#E0F7FA", text: "#00838F" },
  Shopping: { bg: "#EDE7F6", text: "#5E35B1" },
  Recreation: { bg: "#E8F5E9", text: "#2E7D32" },
  Hostel: { bg: "#E1F5FE", text: "#0277BD" },
  School: { bg: "#F1F8E9", text: "#7CB342" },
};

const Home = () => {
  const router = useRouter();
  const [showSearches, setShowSearches] = useState(false);
  const [searchText, setSearchText] = useState("");
  const sheetRef = useRef<BottomSheet | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const { coords = [], loading, error, refetch } = useLocations(); //  safe default
  const userLocation = useUserLocation();

  React.useEffect(() => {
    if (error) {
      setLoadFailed(true);
    }
  }, [error]);

  const [loadFailed, setLoadFailed] = useState(false);

  const getVisibleLocations = () => {
    if (!region) return coords;

    const zoom = region.latitudeDelta;

    if (zoom > 0.05) {
      return coords.filter(
        (item) => item.type === "Faculty" || item.type === "Library",
      );
    }

    if (zoom > 0.01) {
      return coords.filter(
        (item) =>
          ![
            "Lecture Rooms",
            "Faculty",
            "Shopping",
            "Event Centre",
            "Recreation",
            "Food & Dining",
            "Laboratory",
            "Library",
          ].includes(item.type),
      );
    }

    if (zoom > 0.005) {
      return coords.filter(
        (item) =>
          ![
            "Laboratory",
            "Administrative",
            "Event Centre",
            "Food & Dining",
            "Recreation",
            "School",
            "Hostel",
            "Lecture Rooms",
          ].includes(item.type),
      );
    }

    return coords;
  };

  const filteredLocations =
    searchText.trim().length > 0
      ? coords.filter((item: any) =>
          item.name.toLowerCase().includes(searchText.toLowerCase()),
        )
      : coords;

  //  Show all when not searching
  const displayedLocations =
    searchText.trim().length > 0 ? filteredLocations : getVisibleLocations();

  const mapStyle = [
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }],
    },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const nameText = "font-home-medium";

  const handleOpenSheet = (location: any) => {
    setSelectedLocation(location);
    setShowSearches(false);
    Keyboard.dismiss();

    //Animate to region when clicked
    mapRef.current?.animateToRegion({
      latitude: location.coordinate.latitude,
      longitude: location.coordinate.longitude,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    });
    sheetRef.current?.snapToIndex(1);
  };

  const handleGetDirections = (destination: any) => {
    if (!userLocation) return;

    const route = [
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
      {
        latitude: destination.coordinate.latitude,
        longitude: destination.coordinate.longitude,
      },
    ];

    setRouteCoords(route);

    // zoom map to fit both points
    mapRef.current?.fitToCoordinates(route, {
      edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
      animated: true,
    });
  };

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => {
          setShowSearches(false);
          Keyboard.dismiss();
        }}
      >
        <View style={styles.container}>
          {/* MAP */}
          <MapView
            ref={mapRef}
            style={styles.map}
            showsUserLocation
            showsMyLocationButton
            customMapStyle={mapStyle}
            initialRegion={{
              latitude: 7.6786,
              longitude: 4.4532,
              latitudeDelta: 0.001,
              longitudeDelta: 0.001,
            }}
            onRegionChangeComplete={(reg) => setRegion(reg)}
          >
            {displayedLocations.map((item: any) => (
              <Marker
                key={item.id}
                coordinate={{
                  latitude: item.coordinate.latitude,
                  longitude: item.coordinate.longitude,
                }}
                title={item.name}
                onPress={() => handleOpenSheet(item)}
                description={item.type || "Location"}
              >
                <View style={styles.mapName}>
                  {React.createElement(getIcon(item.type), {
                    size: 20,
                    color: getColor(item.type),
                  })}

                  <Text className={nameText}>{item.name}</Text>
                </View>
              </Marker>
            ))}
            {routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeWidth={4}
                strokeColor="#2563EB"
              />
            )}
          </MapView>

          {/* SEARCH SECTION */}
          <View style={styles.searchContainer}>
            <Searchbar
              barText="Search"
              onFocus={() => setShowSearches(true)}
              onChangeText={(text: string) => setSearchText(text)}
            />

            <ScrollItems />

            <ScrollView
              // By conditionally applying height and elevation, we can hide the component
              // without unmounting it. This is a common strategy to prevent a race condition
              // on the native UI thread that can cause the 'Unable to find viewState' error,
              // especially when using the new architecture (Fabric).
              style={[
                styles.dropdown,
                !showSearches && { height: 0, elevation: 0 },
              ]}
              contentContainerStyle={styles.dropdownContent}
              keyboardShouldPersistTaps="handled"
            >
              {filteredLocations.length > 0 ? (
                filteredLocations.map((item: any) => {
                  const style = typeStyles[item.type] || {
                    bg: "#E5E7EB",
                    text: "#374151",
                  };

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.resultCard}
                      onPress={() => handleOpenSheet(item)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.title}>{item.name}</Text>

                        <View
                          style={[
                            styles.typeBadge,
                            { backgroundColor: style.bg },
                          ]}
                        >
                          <Text
                            style={[styles.typeText, { color: style.text }]}
                          >
                            {item.type || "Unknown"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.circle} />
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.noResult}>
                  <Text style={styles.noResultText}>No results found</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* FAB */}
          <View style={styles.fab}>
            <FAB onPress={() => router.push("/Directions")} />
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Location Error */}
      {loadFailed && (
        <LocationError
          reload={() => {
            setLoadFailed(false);
            refetch(); // 🔥 real reload
          }} //  reset error and retry fetching
          close={() => setLoadFailed(false)}
        />
      )}

      <LocationBottomSheet
        ref={sheetRef}
        location={selectedLocation}
        onGetDirections={handleGetDirections}
      />
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1 },

  map: {
    ...StyleSheet.absoluteFill,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    maxHeight: 250,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  dropdownContent: {
    paddingVertical: 8,
  },

  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  title: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "600",
    marginBottom: 4,
  },

  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  typeText: {
    fontSize: 11,
    fontWeight: "500",
  },

  circle: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
  },

  noResult: {
    padding: 20,
    alignItems: "center",
  },

  noResultText: {
    color: "#6B7280",
  },

  fab: {
    position: "absolute",
    bottom: 80,
    right: 24,
  },

  mapName: {
    padding: 6,
    borderRadius: 20,
    elevation: 5,
    display: "flex",
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
});
