/**
 * components/bottomSheets/LocationBottomSheet.tsx
 *
 * CHANGES vs original:
 * - routeInfo now shows ETA + distance at top of sheet (not buried at bottom)
 * - ETA chips styled consistently
 * - Dark mode aware via useTheme()
 * - Uses shared formatDuration/formatDistance from directionServices
 * - "Get Directions" button shows spinner and is disabled while loading
 * - "Save" button wired (placeholder — connect to AsyncStorage in your favorites hook)
 */

import { events } from "@/services/Events";
import { formatDistance, formatDuration } from "@/services/directionServices";
import { useTheme } from "@/context/ThemeContext";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  Clock,
  MapPin,
  Navigation,
  Star,
} from "lucide-react-native";
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
    name:        string;
    type:        string;
    description?: string;
    coordinate: {
      latitude:  number;
      longitude: number;
    };
  };
  onGetDirections: (location: any) => void;
  loading:         boolean;
  routeInfo?: {
    distance: number;
    duration: number;
  };
};

const LocationBottomSheet = forwardRef<BottomSheet, Props>(
  ({ location, onGetDirections, loading, routeInfo }, ref) => {
    const { theme } = useTheme();
    const snapPoints = useMemo(() => ["30%", "55%"], []);
    const [saved, setSaved] = useState(false);

    const backdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.35}
        />
      ),
      [],
    );

    const filteredEvents = useMemo(() => {
      if (!location) return [];
      return events.filter((e) => e.locationName === location.name);
    }, [location]);

    return (
      <BottomSheet
        index={-1}
        snapPoints={snapPoints}
        ref={ref}
        enablePanDownToClose
        backdropComponent={backdrop}
        backgroundStyle={{ backgroundColor: theme.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
      >
        <BottomSheetView style={[styles.container, { backgroundColor: theme.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* ── Location name + type ── */}
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
              {location?.name || "Select a location"}
            </Text>

            <View style={styles.typeRow}>
              <View style={[styles.typeBadge, { backgroundColor: theme.primary + "18" }]}>
                <MapPin size={11} color={theme.primary} />
                <Text style={[styles.typeText, { color: theme.primary }]}>
                  {location?.type || "Location"}
                </Text>
              </View>
            </View>

            {/* ── ETA chips (shows after route is fetched) ── */}
            {routeInfo && (
              <View style={[styles.etaRow, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                <View style={styles.etaChip}>
                  <Clock size={14} color={theme.primary} />
                  <Text style={[styles.etaValue, { color: theme.primary }]}>
                    {formatDuration(routeInfo.duration)}
                  </Text>
                  <Text style={[styles.etaUnit, { color: theme.textMuted }]}>walk</Text>
                </View>

                <View style={[styles.etaDivider, { backgroundColor: theme.border }]} />

                <View style={styles.etaChip}>
                  <MapPin size={14} color={theme.textSecondary} />
                  <Text style={[styles.etaValue, { color: theme.text }]}>
                    {formatDistance(routeInfo.distance)}
                  </Text>
                </View>
              </View>
            )}

            {/* ── Description ── */}
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {location?.description ||
                "Tap on a campus marker to view details about that location."}
            </Text>

            {/* ── Action buttons ── */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: theme.primary },
                  loading && { opacity: 0.65 },
                ]}
                onPress={() => onGetDirections?.(location)}
                disabled={loading || !location}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : (
                    <>
                      <Navigation size={15} color="#fff" />
                      <Text style={styles.primaryBtnText}>Get Directions</Text>
                    </>
                  )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryBtn,
                  {
                    backgroundColor: saved ? theme.primary + "15" : theme.surfaceAlt,
                    borderColor:     saved ? theme.primary        : theme.border,
                  },
                ]}
                onPress={() => setSaved((s) => !s)}
              >
                <Star
                  size={16}
                  color={saved ? theme.primary : theme.textSecondary}
                  fill={saved ? theme.primary : "transparent"}
                />
                <Text style={[styles.secondaryBtnText, { color: saved ? theme.primary : theme.textSecondary }]}>
                  {saved ? "Saved" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Events at this location ── */}
            {filteredEvents.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Events here
                </Text>

                {filteredEvents.map((event) => (
                  <View
                    key={event.id}
                    style={[styles.eventCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
                  >
                    <View style={styles.eventHeader}>
                      <Text style={[styles.eventTitle, { color: theme.text }]}>
                        {event.title}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          event.status === "ongoing"  && styles.statusOngoing,
                          event.status === "upcoming" && styles.statusUpcoming,
                          event.status === "ended"    && styles.statusEnded,
                        ]}
                      >
                        <Text style={styles.statusText}>{event.status}</Text>
                      </View>
                    </View>

                    <Text style={[styles.eventDesc, { color: theme.textSecondary }]}>
                      {event.description}
                    </Text>

                    <Text style={[styles.eventMeta, { color: theme.textMuted }]}>
                      {event.date} · {event.time}
                    </Text>

                    <Text style={[styles.organizer, { color: theme.textMuted }]}>
                      By {event.organizer}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default LocationBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex:              1,
    paddingHorizontal: 20,
    paddingTop:        8,
  },

  name: {
    fontSize:     18,
    fontFamily:   "PlusJakartaSans_700Bold",
    marginBottom: 6,
  },

  typeRow: {
    flexDirection: "row",
    marginBottom:  12,
  },

  typeBadge: {
    flexDirection:    "row",
    alignItems:       "center",
    gap:              4,
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:      999,
  },

  typeText: {
    fontSize:   12,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },

  // ── ETA ──
  etaRow: {
    flexDirection:  "row",
    alignItems:     "center",
    borderRadius:   12,
    borderWidth:    1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom:   14,
    gap:            16,
  },

  etaChip: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           5,
    flex:          1,
  },

  etaValue: {
    fontSize:   15,
    fontFamily: "PlusJakartaSans_700Bold",
  },

  etaUnit: {
    fontSize:   12,
    fontFamily: "PlusJakartaSans_400Regular",
  },

  etaDivider: {
    width:  1,
    height: 20,
  },

  description: {
    fontSize:     14,
    fontFamily:   "PlusJakartaSans_400Regular",
    lineHeight:   21,
    marginBottom: 20,
  },

  // ── Buttons ──
  actions: {
    flexDirection: "row",
    gap:           10,
    marginBottom:  8,
  },

  primaryBtn: {
    flex:           1,
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            6,
    paddingVertical: 13,
    borderRadius:   12,
  },

  primaryBtnText: {
    color:      "#fff",
    fontSize:   15,
    fontFamily: "PlusJakartaSans_700Bold",
  },

  secondaryBtn: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            6,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius:   12,
    borderWidth:    1,
  },

  secondaryBtnText: {
    fontSize:   14,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },

  // ── Events ──
  sectionTitle: {
    fontSize:     15,
    fontFamily:   "PlusJakartaSans_700Bold",
    marginBottom: 10,
  },

  eventCard: {
    borderRadius:  12,
    borderWidth:   1,
    padding:       14,
    marginBottom:  10,
  },

  eventHeader: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "center",
    marginBottom:   6,
  },

  eventTitle: {
    flex:       1,
    fontSize:   14,
    fontFamily: "PlusJakartaSans_700Bold",
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      999,
  },

  statusText: {
    fontSize:   10,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color:      "#fff",
  },

  statusOngoing:  { backgroundColor: "#16A34A" },
  statusUpcoming: { backgroundColor: "#2563EB" },
  statusEnded:    { backgroundColor: "#6B7280" },

  eventDesc: {
    fontSize:     13,
    fontFamily:   "PlusJakartaSans_400Regular",
    marginBottom: 6,
    lineHeight:   19,
  },

  eventMeta: {
    fontSize:     12,
    fontFamily:   "PlusJakartaSans_500Medium",
    marginBottom: 4,
  },

  organizer: {
    fontSize:   11,
    fontFamily: "PlusJakartaSans_400Regular",
  },
});
