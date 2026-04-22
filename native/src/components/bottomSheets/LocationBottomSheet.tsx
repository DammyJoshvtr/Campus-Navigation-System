import { events } from "@/services/Events";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  location?: {
    name: string;
    type: string;
    description?: string;
    coordinate: {
      latitude: number;
      longitude: number;
    };
  };
  onGetDirections: (location: any) => void;
  loading: boolean;
  routeInfo?: {
    distance: number;
    duration: number;
  };
};

// type Props extends EventsProps {
//   location?: {
//     locationName: string;
//   }
// }

const LocationBottomSheet = forwardRef<BottomSheet, Props>(
  ({ location, onGetDirections, loading, routeInfo }, ref) => {
    const [showEvents, setShowEvents] = useState<any | null>(null);
    const snapPoints = useMemo(() => ["25%", "50%"], []);

    const backdrop = useCallback(
      (backdropProps: any) => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      [],
    );

    const filteredEvents = useMemo(() => {
      if (!location) return [];

      return events.filter((event) => event.locationName === location.name);
    }, [location]);

    const formatDuration = (seconds: number) => {
      const mins = Math.round(seconds / 60);

      if (mins < 60) return `${mins} min`;

      const hours = Math.floor(mins / 60);
      const remaining = mins % 60;

      return `${hours}h ${remaining}m`;
    };

    const formatDistance = (meters: number) => {
      const km = meters / 1000;
      return km < 1 ? `${Math.round(meters)} m` : `${km.toFixed(1)} km`;
    };

    return (
      <BottomSheet
        index={-1}
        snapPoints={snapPoints}
        ref={ref}
        enablePanDownToClose
        backdropComponent={backdrop}
      >
        <BottomSheetView style={styles.container}>
          {/* Handle bar */}
          {/* <View style={styles.handleBar} /> */}
          <ScrollView>
            {/* Location Name */}
            <Text className="font-home-semibold">
              {location?.name || "Select a location"}
            </Text>

            {/* Type */}
            <Text style={styles.type} className="font-home-medium">
              {location?.type || "No category"}
            </Text>

            {/* Description */}
            <Text style={styles.description} className="font-home-medium">
              {location?.description ||
                "Tap on a marker to view more details about the location."}
            </Text>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
                onPress={() => onGetDirections?.(location)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="font-home-bold text-white">
                    Get Directions
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn}>
                <Text className="font-home-semibold">Save</Text>
              </TouchableOpacity>
            </View>

            {/* Events Descriptions */}
            <View>
              <Text style={{ marginTop: 30 }} className="font-home-bold">
                Events at this location
              </Text>

              {/* Body */}
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <View key={event.id} style={styles.eventCard}>
                    {/* Header */}
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle}>{event.title}</Text>

                      <View
                        style={[
                          styles.statusBadge,
                          event.status === "ongoing"
                            ? styles.statusOngoing
                            : event.status === "upcoming"
                              ? styles.statusUpcoming
                              : styles.statusEnded,
                        ]}
                        className="font-home-regular"
                      >
                        <Text style={styles.statusText}>{event.status}</Text>
                      </View>
                    </View>

                    {/* Description */}
                    <Text
                      style={{ marginBottom: 8 }}
                      className="font-home-semibold"
                    >
                      {event.description}
                    </Text>

                    {/* Meta Info */}
                    <View style={styles.eventMeta}>
                      <Text className="font-home-regular"> {event.date}</Text>
                      <Text className="font-home-regular"> {event.time}</Text>
                    </View>

                    {/* Organizer */}
                    <Text style={styles.organizer}>
                      Organized by {event.organizer}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noEvents}>No events at this location</Text>
              )}
            </View>

            {routeInfo && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontWeight: "600" }}>
                  🕒 {formatDuration(routeInfo.duration)}
                </Text>
                <Text style={{ color: "#555" }}>
                  📍 {formatDistance(routeInfo.distance)}
                </Text>
              </View>
            )}
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default LocationBottomSheet;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  type: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 20,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  // primaryText: {
  //   color: "#FFFFFF",
  //   fontWeight: "600",
  // },

  secondaryBtn: {
    flex: 1,
    backgroundColor: "#ddd8d8",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  // secondaryText: {
  //   color: "#111827",
  //   fontWeight: "600",
  // },
  eventCard: {
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 14,
    marginTop: 12,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },

  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  eventTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },

  statusOngoing: {
    backgroundColor: "#16A34A", // green
  },

  statusUpcoming: {
    backgroundColor: "#2563EB", // blue
  },

  statusEnded: {
    backgroundColor: "#6B7280", // gray
  },

  eventMeta: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },

  metaText: {
    fontSize: 12,
    color: "#4B5563",
  },

  organizer: {
    fontSize: 11,
    color: "#6B7280",
  },

  noEvents: {
    marginTop: 10,
    color: "#6B7280",
  },
});
