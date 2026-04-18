import React, {
  useCallback,
  useMemo,
  forwardRef,
  useState,
  useEffect,
} from "react";
import { Text, StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { events } from "@/services/Events";

type Props = {
  location?: {
    name: string;
    type: string;
    description?: string;
  };
};

// type Props extends EventsProps {
//   location?: {
//     locationName: string;
//   }
// }

const LocationBottomSheet = forwardRef<BottomSheet, Props>(
  ({ location }, ref) => {
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
            <Text style={styles.title}>
              {location?.name || "Select a location"}
            </Text>

            {/* Type */}
            <Text style={styles.type}>{location?.type || "No category"}</Text>

            {/* Description */}
            <Text style={styles.description}>
              {location?.description ||
                "Tap on a marker to view more details about the location."}
            </Text>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.primaryBtn}>
                <Text style={styles.primaryText}>Get Directions</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn}>
                <Text style={styles.secondaryText}>Save</Text>
              </TouchableOpacity>
            </View>

            {/* Events Descriptions */}
            <View>
              <Text style={[styles.title, { marginTop: 30 }]}>
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
                      >
                        <Text style={styles.statusText}>{event.status}</Text>
                      </View>
                    </View>

                    {/* Description */}
                    <Text style={styles.eventDescription}>
                      {event.description}
                    </Text>

                    {/* Meta Info */}
                    <View style={styles.eventMeta}>
                      <Text style={styles.metaText}>📅 {event.date}</Text>
                      <Text style={styles.metaText}>⏰ {event.time}</Text>
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
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  // handleBar: {
  //   width: 40,
  //   height: 4,
  //   backgroundColor: "#D1D5DB",
  //   borderRadius: 10,
  //   alignSelf: "center",
  //   marginBottom: 10,
  // },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
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

  primaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  secondaryBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  secondaryText: {
    color: "#111827",
    fontWeight: "600",
  },
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

  eventDescription: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
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
