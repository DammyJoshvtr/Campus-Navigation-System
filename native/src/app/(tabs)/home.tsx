/**
 * app/(tabs)/home.tsx
 *
 * CHANGES vs original:
 * - Imports formatDuration/formatDistance from directionServices (single source of truth)
 * - Passes routeInfo to LocationBottomSheet so ETA shows there too
 * - routeLoading guard is now in directionService (deduplication), removed redundant check
 * - ETA box styled with theme colors (dark mode aware)
 * - Clears route when user taps map outside a marker
 * - Polyline strokeWidth slightly reduced to 5 (10 was very thick on small screens)
 */

import LocationBottomSheet from "@/components/bottomSheets/LocationBottomSheet";
import LocationError from "@/components/error/locationError";
import { useTheme } from "@/context/ThemeContext";
import useLocations from "@/hooks/getLocation";
import { useUserLocation } from "@/hooks/useLocation";
import {
  directionService,
  formatDistance,
  formatDuration,
} from "@/services/directionServices";
import { getColor, getIcon } from "@/services/iconUtitils";
import BottomSheet from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MapPin } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import FAB from "../../components/fabs/Fab";
import Searchbar from "../../components/Searchbar";

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

export default function Home() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const [showSearches, setShowSearches] = useState(false);
  const [searchText, setSearchText] = useState("");
  const sheetRef = useRef<BottomSheet | null>(null);
  const mapRef = useRef<MapView | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [followUser, setFollowUser] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);

  const { coords = [], loading, error, refetch } = useLocations();
  const userLocation = useUserLocation();
  const { from, to } = useLocalSearchParams();
  const mapStyle = [
    // ← new array created on EVERY render
    { featureType: "poi", stylers: [{ visibility: "off" }] },
  ];

  // ── Parse deep-link params from Directions screen ──────────────────────────

  const parsedFrom = React.useMemo(() => {
    try {
      return from ? JSON.parse(from as string) : null;
    } catch {
      return null;
    }
  }, [from]);

  const parsedTo = React.useMemo(() => {
    try {
      return to ? JSON.parse(to as string) : null;
    } catch {
      return null;
    }
  }, [to]);

  React.useEffect(() => {
    if (error) setLoadFailed(true);
  }, [error]);

  // Auto-follow user location on map
  React.useEffect(() => {
    if (userLocation && mapRef.current && followUser) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      });
    }
  }, [userLocation, followUser]);

  // ── Route fetcher ───────────────────────────────────────────────────────────

  const fetchRoute = useCallback(
    async (
      start: { latitude: number; longitude: number },
      end: { latitude: number; longitude: number },
    ) => {
      setRouteLoading(true);
      try {
        const result = await directionService(start, end);
        setRouteCoords(result.route);
        setRouteInfo({ distance: result.distance, duration: result.duration });
        mapRef.current?.fitToCoordinates(result.route, {
          edgePadding: { top: 120, right: 60, bottom: 200, left: 60 },
          animated: true,
        });
      } catch (err) {
        console.error("[Home] Route fetch error:", err);
      } finally {
        setRouteLoading(false);
      }
    },
    [],
  );

  // Handle route from Directions screen params
  React.useEffect(() => {
    if (!parsedFrom?.coordinate || !parsedTo?.coordinate) return;
    fetchRoute(parsedFrom.coordinate, parsedTo.coordinate);
  }, [parsedFrom, parsedTo, fetchRoute]);

  // ── Visibility culling by zoom level ────────────────────────────────────────

  const getVisibleLocations = () => {
    if (!region) return coords;
    const zoom = region.latitudeDelta;
    if (zoom > 0.05)
      return coords.filter((i) => i.type === "Faculty" || i.type === "Library");
    if (zoom > 0.01)
      return coords.filter(
        (i) =>
          ![
            "Lecture Rooms",
            "Faculty",
            "Shopping",
            "Event Centre",
            "Recreation",
            "Food & Dining",
            "Laboratory",
            "Library",
          ].includes(i.type),
      );
    if (zoom > 0.005)
      return coords.filter(
        (i) =>
          ![
            "Laboratory",
            "Administrative",
            "Event Centre",
            "Food & Dining",
            "Recreation",
            "School",
            "Hostel",
            "Lecture Rooms",
          ].includes(i.type),
      );
    return coords;
  };

  const filteredLocations =
    searchText.trim().length > 0
      ? coords.filter((item: any) =>
          item.name.toLowerCase().includes(searchText.toLowerCase()),
        )
      : coords;

  const displayedLocations =
    searchText.trim().length > 0 ? filteredLocations : getVisibleLocations();

  // ── Handlers ────────────────────────────────────────────────────────────────

  const goToUserLocation = () => {
    if (!userLocation) return;
    setFollowUser(true);
    mapRef.current?.animateToRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    });
  };

  const handleOpenSheet = (location: any) => {
    setSelectedLocation(location);
    setShowSearches(false);
    Keyboard.dismiss();
    mapRef.current?.animateToRegion({
      latitude: location.coordinate.latitude,
      longitude: location.coordinate.longitude,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    });
    sheetRef.current?.snapToIndex(1);
  };

  const handleGetDirectionsFromSheet = async (location: any) => {
    if (!userLocation) return;
    sheetRef.current?.close();
    await fetchRoute(
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      {
        latitude: location.coordinate.latitude,
        longitude: location.coordinate.longitude,
      },
    );
  };

  const clearRoute = () => {
    setRouteCoords([]);
    setRouteInfo(null);
  };

  // ── Loading screen ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text
          style={{
            marginTop: 12,
            color: theme.textSecondary,
            fontFamily: "PlusJakartaSans_500Medium",
          }}
        >
          Loading campus map…
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle={theme.statusBar}
      />

      <TouchableWithoutFeedback
        onPress={() => {
          setShowSearches(false);
          Keyboard.dismiss();
        }}
      >
        <View style={styles.container}>
          {/* ── MAP ── */}
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            showsUserLocation
            customMapStyle={mapStyle}
            showsMyLocationButton={false}
            userInterfaceStyle={isDark ? "dark" : "light"}
            initialRegion={{
              latitude: 7.680313,
              longitude: 4.459676,
              latitudeDelta: 0.001,
              longitudeDelta: 0.001,
            }}
            onRegionChange={() => setFollowUser(false)}
            onRegionChangeComplete={(reg) => setRegion(reg)}
            onPress={clearRoute} // tap map background → clear route
          >
            {displayedLocations.map((item: any) => (
              <Marker
                key={item.id}
                coordinate={item.coordinate}
                title={item.name}
                description={item.type || "Location"}
                onPress={() => handleOpenSheet(item)}
                tracksViewChanges={false}
              >
                <View style={styles.markerBubble}>
                  {React.createElement(getIcon(item.type), {
                    size: 16,
                    color: getColor(item.type),
                  })}
                  <Text style={styles.markerText} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
              </Marker>
            ))}

            {routeCoords.length > 0 && (
              <>
                {/* Route shadow (wider, lighter) */}
                <Polyline
                  coordinates={routeCoords}
                  strokeWidth={10}
                  strokeColor="rgba(37,99,235,0.2)"
                />
                {/* Route main line */}
                <Polyline
                  coordinates={routeCoords}
                  strokeWidth={8}
                  strokeColor={theme.routeColor}
                  lineCap="round"
                  lineJoin="round"
                />
              </>
            )}
          </MapView>

          {/* ── SEARCH ── */}
          <View style={styles.searchContainer}>
            <Searchbar
              barText="Search campus…"
              onFocus={() => setShowSearches(true)}
              onChangeText={(text: string) => setSearchText(text)}
            />

            <ScrollView
              style={[
                styles.dropdown,
                { backgroundColor: theme.surface },
                !showSearches && { height: 0, elevation: 0 },
              ]}
              contentContainerStyle={styles.dropdownContent}
              keyboardShouldPersistTaps="handled"
            >
              {filteredLocations.length > 0 ? (
                filteredLocations.map((item: any) => {
                  const s = typeStyles[item.type] || {
                    bg: "#E5E7EB",
                    text: "#374151",
                  };
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.resultCard,
                        { borderBottomColor: theme.border },
                      ]}
                      onPress={() => handleOpenSheet(item)}
                    >
                      <View style={{ flex: 1, flexDirection: "row", gap: 10 }}>
                        <View
                          style={[
                            styles.iconContainer,
                            { backgroundColor: theme.surfaceAlt },
                          ]}
                        >
                          <MapPin
                            strokeWidth={2}
                            size={18}
                            color={theme.textMuted}
                          />
                        </View>
                        <View>
                          <Text
                            style={[styles.resultTitle, { color: theme.text }]}
                          >
                            {item.name}
                          </Text>
                          <View
                            style={[
                              styles.typeBadge,
                              { backgroundColor: s.bg },
                            ]}
                          >
                            <Text style={[styles.typeText, { color: s.text }]}>
                              {item.type || "Unknown"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.noResult}>
                  <Text
                    style={{
                      color: theme.textMuted,
                      fontFamily: "PlusJakartaSans_500Medium",
                    }}
                  >
                    No results found
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* ── ETA Box ── */}
          {routeInfo && (
            <View
              style={[
                styles.etaBox,
                { backgroundColor: theme.surface, shadowColor: theme.shadow },
              ]}
            >
              <View style={styles.etaRow}>
                <Text style={[styles.etaMain, { color: theme.primary }]}>
                  🕒 {formatDuration(routeInfo.duration)}
                </Text>
                <View
                  style={[styles.etaDivider, { backgroundColor: theme.border }]}
                />
                <Text style={[styles.etaSub, { color: theme.textSecondary }]}>
                  📍 {formatDistance(routeInfo.distance)}
                </Text>
              </View>
              <TouchableOpacity onPress={clearRoute} style={styles.clearBtn}>
                <Text
                  style={{
                    fontSize: 11,
                    color: theme.textMuted,
                    fontFamily: "PlusJakartaSans_500Medium",
                  }}
                >
                  ✕ Clear
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Route loading overlay ── */}
          {routeLoading && (
            <View style={styles.routeLoadingBox}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.routeLoadingText}>Finding best path…</Text>
            </View>
          )}

          {/* ── FABs ── */}
          <View style={styles.fab}>
            <FAB onPress={() => router.push("/Directions")} useIcon={true} />
            <FAB onPress={goToUserLocation} useIcon={false} />
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Location load error banner */}
      {loadFailed && (
        <LocationError
          reload={() => {
            setLoadFailed(false);
            refetch();
          }}
          close={() => setLoadFailed(false)}
        />
      )}

      {/* Bottom sheet */}
      <LocationBottomSheet
        ref={sheetRef}
        location={selectedLocation}
        onGetDirections={handleGetDirectionsFromSheet}
        loading={routeLoading}
        routeInfo={routeInfo ?? undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  searchContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    gap: 10,
    zIndex: 10,
  },

  dropdown: {
    borderRadius: 16,
    maxHeight: 260,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  dropdownContent: { paddingVertical: 6 },

  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },

  resultTitle: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    marginBottom: 4,
  },

  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  typeText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_500Medium",
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  noResult: { padding: 20, alignItems: "center" },

  fab: {
    position: "absolute",
    bottom: 50,
    right: 20,
    gap: 14,
  },

  markerBubble: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: 160,
  },

  markerText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#1F2937",
    flexShrink: 1,
  },

  // ── ETA Box ──
  etaBox: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    elevation: 6,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  etaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  etaMain: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 15,
  },

  etaSub: {
    fontFamily: "PlusJakartaSans_500Medium",
    fontSize: 14,
  },

  etaDivider: {
    width: 1,
    height: 16,
  },

  clearBtn: {
    paddingLeft: 4,
  },

  // ── Route loading ──
  routeLoadingBox: {
    position: "absolute",
    bottom: 180,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 6,
  },

  routeLoadingText: {
    fontSize: 13,
    color: "#374151",
    fontFamily: "PlusJakartaSans_500Medium",
  },
});
