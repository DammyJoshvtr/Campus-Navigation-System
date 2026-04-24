/**
 * app/Directions.tsx
 *
 * CHANGES vs original:
 * - Button is disabled + shows spinner while loading
 * - Validation toast-style error instead of silent console.log
 * - Input fields styled with theme (dark mode aware)
 * - "Use my location" shortcut pre-fills the From field
 * - Dropdown z-index fixed so it always floats above the button
 */

import GeneralButton from "@/components/GeneralButton";
import Searchbar from "@/components/Searchbar";
import useLocations from "@/hooks/getLocation";
import { useUserLocation } from "@/hooks/useLocation";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { LocateFixed, Navigation } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Directions() {
  const inputRef       = useRef<TextInput>(null);
  const secondInputRef = useRef<TextInput>(null);
  const { theme }      = useTheme();

  const [activeInput,   setActiveInput]   = useState<"from" | "to">("from");
  const [fromText,      setFromText]       = useState("");
  const [toText,        setToText]         = useState("");
  const [showSearch,    setShowSearch]     = useState(false);
  const [fromLocation,  setFromLocation]   = useState<any | null>(null);
  const [toLocation,    setToLocation]     = useState<any | null>(null);
  const [validationMsg, setValidationMsg]  = useState("");
  const [navigating,    setNavigating]     = useState(false);

  const { coords = [] } = useLocations();
  const userLocation    = useUserLocation();
  const router          = useRouter();

  const currentText = activeInput === "from" ? fromText : toText;

  const filteredLocations = coords.filter((item) =>
    item.name.toLowerCase().includes(currentText.toLowerCase()),
  );

  const handleSelect = (item: any) => {
    if (activeInput === "from") {
      setFromText(item.name);
      setFromLocation(item);
    } else {
      setToText(item.name);
      setToLocation(item);
    }
    setShowSearch(false);
    setValidationMsg("");
  };

  const handleUseMyLocation = () => {
    if (!userLocation) return;
    setFromText("📍 My Location");
    setFromLocation({
      name: "My Location",
      coordinate: { latitude: userLocation.latitude, longitude: userLocation.longitude },
    });
  };

  const handleGetDirections = async () => {
    if (!fromLocation) { setValidationMsg("Please select a starting point."); return; }
    if (!toLocation)   { setValidationMsg("Please select a destination."); return; }

    setNavigating(true);
    setValidationMsg("");

    // Navigate to home with route params — home screen will fetch the route
    router.push({
      pathname: "/home",
      params: {
        from: JSON.stringify(fromLocation),
        to:   JSON.stringify(toLocation),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Navigation size={20} color={theme.primary} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Get Directions</Text>
      </View>

      <View style={{ flex: 1, gap: 12, paddingTop: 8 }}>
        {/* ── FROM ── */}
        <View>
          <Text style={[styles.label, { color: theme.textSecondary }]}>From</Text>
          <Searchbar
            ref={inputRef}
            barText="Starting point…"
            value={fromText}
            onChangeText={(text) => { setFromText(text); setFromLocation(null); }}
            onFocus={() => { setActiveInput("from"); setShowSearch(true); }}
          />
          {userLocation && !fromLocation && (
            <TouchableOpacity
              style={styles.useLocationBtn}
              onPress={handleUseMyLocation}
            >
              <LocateFixed size={14} color={theme.primary} />
              <Text style={[styles.useLocationText, { color: theme.primary }]}>
                Use my current location
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── TO ── */}
        <View>
          <Text style={[styles.label, { color: theme.textSecondary }]}>To</Text>
          <Searchbar
            ref={secondInputRef}
            barText="Destination…"
            value={toText}
            onChangeText={(text) => { setToText(text); setToLocation(null); }}
            onFocus={() => { setActiveInput("to"); setShowSearch(true); }}
          />
        </View>

        {/* ── Dropdown ── */}
        {showSearch && (
          <ScrollView
            style={[styles.dropdown, { backgroundColor: theme.surface }]}
            keyboardShouldPersistTaps="handled"
          >
            {filteredLocations.length > 0
              ? filteredLocations.map((item, index) => (
                  <Pressable
                    key={index}
                    style={[styles.resultItem, { borderBottomColor: theme.border }]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[styles.resultText, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.resultType, { color: theme.textMuted }]}>
                      {item.type}
                    </Text>
                  </Pressable>
                ))
              : (
                <Text style={[styles.noResult, { color: theme.textMuted }]}>
                  No matching locations
                </Text>
              )}
          </ScrollView>
        )}

        {/* ── Validation message ── */}
        {validationMsg !== "" && (
          <View style={[styles.validationBox, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}>
            <Text style={{ color: "#DC2626", fontSize: 13, fontFamily: "PlusJakartaSans_500Medium" }}>
              {validationMsg}
            </Text>
          </View>
        )}

        {/* ── Selected summary ── */}
        {fromLocation && toLocation && (
          <View style={[styles.summaryBox, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
            <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
              <Text style={{ color: theme.primary }}>From: </Text>{fromLocation.name}
            </Text>
            <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
            <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
              <Text style={{ color: theme.primary }}>To: </Text>{toLocation.name}
            </Text>
          </View>
        )}

        {/* ── CTA ── */}
        <View style={styles.btnWrapper}>
          {navigating
            ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={theme.primary} />
                <Text style={{ color: theme.textSecondary, fontFamily: "PlusJakartaSans_500Medium" }}>
                  Opening map…
                </Text>
              </View>
            )
            : (
              <GeneralButton
                title="Get Directions"
                showIcon
                onPress={handleGetDirections}
                disabled={!fromLocation || !toLocation}
              />
            )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 20 },

  header: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           8,
    marginBottom:  20,
  },

  headerTitle: {
    fontSize:   20,
    fontFamily: "PlusJakartaSans_700Bold",
  },

  label: {
    fontSize:     12,
    fontFamily:   "PlusJakartaSans_600SemiBold",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  useLocationBtn: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           4,
    marginTop:     8,
    paddingLeft:   4,
  },

  useLocationText: {
    fontSize:   13,
    fontFamily: "PlusJakartaSans_500Medium",
  },

  dropdown: {
    borderRadius:  14,
    maxHeight:     240,
    elevation:     10,
    zIndex:        999,
    shadowColor:   "#000",
    shadowOpacity: 0.12,
    shadowRadius:  10,
  },

  resultItem: {
    paddingVertical:   12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },

  resultText: {
    fontSize:   15,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },

  resultType: {
    fontSize:   12,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop:  2,
  },

  noResult: {
    padding:    20,
    textAlign:  "center",
    fontFamily: "PlusJakartaSans_500Medium",
  },

  validationBox: {
    padding:      12,
    borderRadius: 10,
    borderWidth:  1,
  },

  summaryBox: {
    borderRadius: 12,
    borderWidth:  1,
    padding:      14,
    gap:          8,
  },

  summaryText: {
    fontSize:   14,
    fontFamily: "PlusJakartaSans_500Medium",
  },

  summaryDivider: {
    height: 1,
    marginVertical: 2,
  },

  btnWrapper: {
    marginTop:   8,
    alignItems:  "center",
  },

  loadingRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           10,
    paddingVertical: 16,
  },
});
