/**
 * app/(tabs)/profile.tsx
 *
 * Full profile page with:
 * - Avatar with initials fallback
 * - Name, student ID, faculty, level
 * - Edit profile (inline editing)
 * - Saved locations count (placeholder)
 * - Logout button
 * - Dark mode aware throughout
 */

import { useTheme } from "@/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Save,
  Settings,
  User,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  name: string;
  email: string;
  studentId: string;
  faculty: string;
  level: string;
}

const DEFAULT_PROFILE: ProfileData = {
  name: "John Adeyemi",
  email: "j.adeyemi@redemption.edu.ng",
  studentId: "CSC/2021/042",
  faculty: "Computing & Information Technology",
  level: "400 Level",
};

const PROFILE_KEY = "@campus_profile";

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, size = 90 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>
        {initials}
      </Text>
    </View>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
      <View style={[styles.infoIcon, { backgroundColor: theme.surfaceAlt }]}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
          {label}
        </Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Edit field ───────────────────────────────────────────────────────────────

function EditField({
  label,
  value,
  onChangeText,
  theme,
  autoCapitalize = "words",
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  theme: any;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
}) {
  return (
    <View style={styles.editField}>
      <Text style={[styles.editLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        style={[
          styles.editInput,
          {
            backgroundColor: theme.surfaceAlt,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        placeholderTextColor={theme.textMuted}
      />
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function Profile() {
  const { theme, isDark } = useTheme();
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileData>(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter();

  // Load saved profile
  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY).then((raw) => {
      if (raw) {
        try {
          setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
        } catch {}
      }
    });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const startEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveProfile = async () => {
    setSaving(true);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(draft));
    setProfile(draft);
    setSaving(false);
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          // Clear session and profile, then navigate to index
          await AsyncStorage.removeItem("@campus_session");
          await AsyncStorage.removeItem("@campus_profile");
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.bg }]}
      edges={["top"]}
    >
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ─────────────────────────────────────────────────── */}
          <View style={styles.pageHeader}>
            <Text style={[styles.pageTitle, { color: theme.text }]}>
              My Profile
            </Text>

            {!editing ? (
              <TouchableOpacity
                style={[
                  styles.editBtn,
                  {
                    backgroundColor: theme.surfaceAlt,
                    borderColor: theme.border,
                  },
                ]}
                onPress={startEdit}
              >
                <Pencil size={14} color={theme.primary} />
                <Text style={[styles.editBtnText, { color: theme.primary }]}>
                  Edit
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={cancelEdit} hitSlop={12}>
                <X size={22} color={theme.textMuted} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => {
                router.push("/Settings");
              }}
              hitSlop={12}
            >
              <Settings size={22} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* ── Avatar + Name ──────────────────────────────────────────── */}
          <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
            <Avatar name={profile.name} />

            <View style={styles.heroText}>
              <Text style={[styles.heroName, { color: theme.text }]}>
                {profile.name}
              </Text>
              <Text style={[styles.heroId, { color: theme.textMuted }]}>
                {profile.studentId}
              </Text>

              {/* Level badge */}
              <View style={styles.levelBadge}>
                <GraduationCap size={12} color={theme.primary} />
                <Text style={[styles.levelText, { color: theme.primary }]}>
                  {profile.level}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* ── Stats row ─────────────────────────────────────────────── */}
          <View style={styles.statsRow}>
            {[
              { label: "Routes", value: "12" },
              { label: "Saved", value: "5" },
              { label: "Events", value: "3" },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: theme.primary }]}>
                    {s.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                    {s.label}
                  </Text>
                </View>
                {i < 2 && (
                  <View
                    style={[
                      styles.statDivider,
                      { backgroundColor: theme.border },
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* ── EDIT FORM ─────────────────────────────────────────────── */}
          {editing && (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Edit Profile
              </Text>

              <EditField
                label="Full Name"
                value={draft.name}
                onChangeText={(v) => setDraft((p) => ({ ...p, name: v }))}
                theme={theme}
              />
              <EditField
                label="Email"
                value={draft.email}
                onChangeText={(v) => setDraft((p) => ({ ...p, email: v }))}
                theme={theme}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <EditField
                label="Student ID"
                value={draft.studentId}
                onChangeText={(v) => setDraft((p) => ({ ...p, studentId: v }))}
                theme={theme}
                autoCapitalize="characters"
              />
              <EditField
                label="Faculty"
                value={draft.faculty}
                onChangeText={(v) => setDraft((p) => ({ ...p, faculty: v }))}
                theme={theme}
              />
              <EditField
                label="Level"
                value={draft.level}
                onChangeText={(v) => setDraft((p) => ({ ...p, level: v }))}
                theme={theme}
              />

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                onPress={saveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Save size={16} color="#fff" />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ── INFO CARD ─────────────────────────────────────────────── */}
          {!editing && (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Personal Info
              </Text>

              <InfoRow
                icon={<User size={16} color={theme.primary} />}
                label="Full Name"
                value={profile.name}
                theme={theme}
              />
              <InfoRow
                icon={<Mail size={16} color={theme.primary} />}
                label="Email"
                value={profile.email}
                theme={theme}
              />
              <InfoRow
                icon={<BookOpen size={16} color={theme.primary} />}
                label="Faculty"
                value={profile.faculty}
                theme={theme}
              />
              <InfoRow
                icon={<GraduationCap size={16} color={theme.primary} />}
                label="Level"
                value={profile.level}
                theme={theme}
              />
            </View>
          )}

          {/* ── QUICK LINKS ───────────────────────────────────────────── */}
          {!editing && (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Quick Actions
              </Text>

              {[
                {
                  label: "Saved Places",
                  icon: <MapPin size={18} color={theme.primary} />,
                },
                {
                  label: "My Routes",
                  icon: <MapPin size={18} color={theme.primary} />,
                },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.quickRow, { borderBottomColor: theme.border }]}
                >
                  <View
                    style={[
                      styles.infoIcon,
                      { backgroundColor: theme.surfaceAlt },
                    ]}
                  >
                    {item.icon}
                  </View>
                  <Text style={[styles.quickLabel, { color: theme.text }]}>
                    {item.label}
                  </Text>
                  <ChevronRight size={18} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── LOGOUT ───────────────────────────────────────────────── */}
          {!editing && (
            <TouchableOpacity
              style={[
                styles.logoutBtn,
                { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" },
              ]}
              onPress={handleLogout}
            >
              <LogOut size={18} color="#DC2626" />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingTop: 12 },

  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  pageTitle: {
    fontSize: 22,
    fontFamily: "PlusJakartaSans_700Bold",
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },

  editBtnText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },

  // ── Hero ──
  heroSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },

  avatar: {
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontFamily: "PlusJakartaSans_700Bold",
  },

  heroText: { flex: 1, gap: 4 },

  heroName: {
    fontSize: 20,
    fontFamily: "PlusJakartaSans_700Bold",
  },

  heroId: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
  },

  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 4,
  },

  levelText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },

  // ── Stats ──
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    marginBottom: 16,
  },

  stat: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 20, fontFamily: "PlusJakartaSans_700Bold" },
  statLabel: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
    marginTop: 2,
  },
  statDivider: { width: 1, height: "70%", alignSelf: "center" },

  // ── Card ──
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_700Bold",
    marginBottom: 16,
  },

  // ── Info row ──
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  infoLabel: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_500Medium",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  infoValue: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },

  // ── Edit form ──
  editField: { marginBottom: 14 },

  editLabel: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  editInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "PlusJakartaSans_400Regular",
  },

  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
    marginTop: 8,
  },

  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
  },

  // ── Quick links ──
  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },

  quickLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "PlusJakartaSans_500Medium",
  },

  // ── Logout ──
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },

  logoutText: {
    color: "#DC2626",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
