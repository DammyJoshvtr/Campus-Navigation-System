/**
 * app/(tabs)/settings.tsx
 *
 * Settings screen with:
 * - Dark mode toggle (persisted)
 * - Map tile style selector (Standard / Voyager / Dark)
 * - Distance units toggle
 * - App version info
 * - All theme-aware
 */

import { useTheme } from "@/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Bell,
  ChevronRight,
  Info,
  Map,
  Moon,
  Ruler,
  Sun,
  Vibrate,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppPrefs {
  units:         "metric" | "imperial";
  notifications: boolean;
  haptics:       boolean;
  tileStyle:     "standard" | "voyager" | "dark";
}

const DEFAULT_PREFS: AppPrefs = {
  units:         "metric",
  notifications: true,
  haptics:       true,
  tileStyle:     "voyager",
};

const PREFS_KEY = "@campus_prefs";

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, theme }: { title: string; theme: any }) {
  return (
    <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>{title}</Text>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({
  icon,
  label,
  description,
  value,
  onToggle,
  theme,
}: {
  icon:        React.ReactNode;
  label:       string;
  description?: string;
  value:       boolean;
  onToggle:    (v: boolean) => void;
  theme:       any;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <View style={[styles.rowIcon, { backgroundColor: theme.surfaceAlt }]}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.rowDesc, { color: theme.textMuted }]}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        thumbColor={value ? "#fff" : "#f4f3f4"}
        trackColor={{ false: "#E5E7EB", true: theme.primary }}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
}

// ─── Selector row ─────────────────────────────────────────────────────────────

function SelectorRow({
  icon,
  label,
  value,
  onPress,
  theme,
}: {
  icon:    React.ReactNode;
  label:   string;
  value:   string;
  onPress: () => void;
  theme:   any;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: theme.border }]}
      onPress={onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: theme.surfaceAlt }]}>
        {icon}
      </View>
      <Text style={[styles.rowLabel, { color: theme.text, flex: 1 }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.primary }]}>{value}</Text>
      <ChevronRight size={16} color={theme.textMuted} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function Settings() {
  const { theme, isDark, toggle } = useTheme();
  const [prefs, setPrefs]         = useState<AppPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then((raw: any) => {
      if (raw) {
        try { setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) }); } catch {}
      }
    });
  }, []);

  const save = (patch: Partial<AppPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const pickTileStyle = () => {
    const options = [
      { label: "Standard (OpenStreetMap)", value: "standard" },
      { label: "Voyager (CartoDB)",        value: "voyager"  },
      { label: "Dark (CartoDB Dark)",      value: "dark"     },
    ];

    Alert.alert(
      "Map Style",
      "Choose how the map tiles look",
      [
        ...options.map((o) => ({
          text:    `${prefs.tileStyle === o.value ? "✓ " : ""}${o.label}`,
          onPress: () => save({ tileStyle: o.value as AppPrefs["tileStyle"] }),
        })),
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const pickUnits = () => {
    Alert.alert("Distance Units", "Choose your preferred units", [
      { text: `${prefs.units === "metric" ? "✓ " : ""}Metric (km, m)`,       onPress: () => save({ units: "metric"   }) },
      { text: `${prefs.units === "imperial" ? "✓ " : ""}Imperial (mi, ft)`, onPress: () => save({ units: "imperial" }) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const tileLabel: Record<string, string> = {
    standard: "OpenStreetMap",
    voyager:  "Voyager",
    dark:     "Dark",
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={["top"]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page title ── */}
        <Text style={[styles.pageTitle, { color: theme.text }]}>Settings</Text>

        {/* ── Appearance ── */}
        <SectionHeader title="Appearance" theme={theme} />
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ToggleRow
            icon={isDark
              ? <Moon size={18} color={theme.primary} />
              : <Sun  size={18} color={theme.primary} />}
            label="Dark Mode"
            description={isDark ? "Dark theme is on" : "Light theme is on"}
            value={isDark}
            onToggle={toggle}
            theme={theme}
          />
        </View>

        {/* ── Map ── */}
        <SectionHeader title="Map" theme={theme} />
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SelectorRow
            icon={<Map size={18} color={theme.primary} />}
            label="Map Style"
            value={tileLabel[prefs.tileStyle]}
            onPress={pickTileStyle}
            theme={theme}
          />
          <SelectorRow
            icon={<Ruler size={18} color={theme.primary} />}
            label="Distance Units"
            value={prefs.units === "metric" ? "Metric" : "Imperial"}
            onPress={pickUnits}
            theme={theme}
          />
        </View>

        {/* ── Notifications ── */}
        <SectionHeader title="Notifications & Feedback" theme={theme} />
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ToggleRow
            icon={<Bell size={18} color={theme.primary} />}
            label="Notifications"
            description="Event reminders and campus alerts"
            value={prefs.notifications}
            onToggle={(v) => save({ notifications: v })}
            theme={theme}
          />
          <ToggleRow
            icon={<Vibrate size={18} color={theme.primary} />}
            label="Haptic Feedback"
            description="Vibrate on map interactions"
            value={prefs.haptics}
            onToggle={(v) => save({ haptics: v })}
            theme={theme}
          />
        </View>

        {/* ── Tile URL note ── */}
        <View style={[styles.noteBox, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Info size={14} color={theme.textMuted} />
          <Text style={[styles.noteText, { color: theme.textMuted }]}>
            Map tiles are served by OpenStreetMap and CartoDB. Changing the
            tile style takes effect the next time you open the map.
          </Text>
        </View>

        {/* ── About ── */}
        <SectionHeader title="About" theme={theme} />
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {[
            ["App",           "Redeemer's University Maps"],
            ["Version",       "1.0.0 (build 1)"],
            ["Built with",    "Expo · react-native-maps · OSM"],
            ["Routing",       "OpenRouteService + OSRM"],
          ].map(([k, v]) => (
            <View key={k} style={[styles.aboutRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.aboutKey, { color: theme.textMuted }]}>{k}</Text>
              <Text style={[styles.aboutVal, { color: theme.text }]}>{v}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { padding: 20, paddingTop: 12 },

  pageTitle: {
    fontSize:   22,
    fontFamily: "PlusJakartaSans_700Bold",
    marginBottom: 24,
  },

  sectionHeader: {
    fontSize:      11,
    fontFamily:    "PlusJakartaSans_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom:  8,
    marginTop:     20,
    paddingHorizontal: 4,
  },

  card: {
    borderRadius: 16,
    borderWidth:  1,
    overflow:     "hidden",
  },

  row: {
    flexDirection:     "row",
    alignItems:        "center",
    gap:               12,
    paddingVertical:   14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },

  rowIcon: {
    width:          36,
    height:         36,
    borderRadius:   10,
    alignItems:     "center",
    justifyContent: "center",
  },

  rowLabel: {
    fontSize:   15,
    fontFamily: "PlusJakartaSans_500Medium",
  },

  rowDesc: {
    fontSize:   12,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop:  2,
  },

  rowValue: {
    fontSize:   13,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },

  noteBox: {
    flexDirection:    "row",
    gap:              10,
    padding:          14,
    borderRadius:     12,
    borderWidth:      1,
    marginTop:        12,
    alignItems:       "flex-start",
  },

  noteText: {
    flex:       1,
    fontSize:   12,
    fontFamily: "PlusJakartaSans_400Regular",
    lineHeight: 18,
  },

  aboutRow: {
    flexDirection:     "row",
    justifyContent:    "space-between",
    paddingVertical:   12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },

  aboutKey: {
    fontSize:   13,
    fontFamily: "PlusJakartaSans_500Medium",
  },

  aboutVal: {
    fontSize:   13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    textAlign:  "right",
    flex:       1,
    marginLeft: 16,
  },
});
